import { ChessEngine, MASTER_PROFILES } from './engine.js';
import { BoardRenderer } from './board.js';
import { ChessPieces } from './pieces.js';
import { ChessAnimations } from './animations.js';

export class ChessGame {
  constructor() {
    this.engine = new ChessEngine();
    this.board = new BoardRenderer();
    this.pieces = new ChessPieces();
    this.animations = new ChessAnimations(this);
    
    this.state = [];
    this.historyStates = [];
    this.turn = 'white';
    this.selectedIndex = null;
    this.legalMoves = [];
    this.moveHistory = [];
    this.inCheck = false;
    this.inCheckmate = false;
    this.gameOver = false;

    // Settings
    this.gameMode = 'pve-white';
    this.activeMaster = 'sunfish';
    this.difficulty = 'advanced';
    this.showHints = true;
    this.showEvalBar = true;
    this.showThreats = false;

    this.init();
    this.setupEventListeners();
  }

  init() {
    this.state = this.engine.generateBoard();
    this.historyStates = [[...this.state]];
    this.board.render(this.state, this);
    this.pieces.drawPieces(this.board.container, this.state);
    this.updateUI();

    // Trigger AI move if AI is White (pve-black or eve mode)
    if ((this.gameMode === 'pve-black' || this.gameMode === 'eve') && this.turn === 'white') {
      setTimeout(() => this.triggerAIMove(), 500);
    }
  }

  setupEventListeners() {
    // Tabs Navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        btn.classList.add('active');
        const tabId = btn.dataset.tab;
        document.getElementById(`tab-${tabId}`).classList.add('active');
      });
    });

    // Control Bar Buttons
    document.getElementById('btn-clear-cache')?.addEventListener('click', () => this.clearCache());
    document.getElementById('btn-restart')?.addEventListener('click', () => this.resetGame());
    document.getElementById('btn-flip')?.addEventListener('click', () => {
      this.board.flipBoard(this.state, this);
      this.updateUI();
    });
    document.getElementById('btn-undo')?.addEventListener('click', () => this.undoMove());
    document.getElementById('btn-hint')?.addEventListener('click', () => this.showHint());
    document.getElementById('btn-threat')?.addEventListener('click', () => {
      this.showThreats = !this.showThreats;
      document.getElementById('toggle-threats').checked = this.showThreats;
      this.updateUI();
    });

    // Master Profiles Dropdown & Grid Cards
    document.getElementById('master-select-dropdown')?.addEventListener('change', (e) => {
      this.selectMaster(e.target.value);
    });

    document.querySelectorAll('.master-card').forEach(card => {
      card.addEventListener('click', () => {
        const masterId = card.dataset.master;
        this.selectMaster(masterId);
      });
    });

    // Settings Selectors
    document.getElementById('mode-select')?.addEventListener('change', (e) => {
      this.gameMode = e.target.value;
      this.resetGame();
    });

    document.getElementById('difficulty-select')?.addEventListener('change', (e) => {
      this.difficulty = e.target.value;
    });

    document.getElementById('theme-select')?.addEventListener('change', (e) => {
      document.body.setAttribute('data-theme', e.target.value);
    });

    // Toggles
    document.getElementById('toggle-hints')?.addEventListener('change', (e) => {
      this.showHints = e.target.checked;
    });

    document.getElementById('toggle-eval')?.addEventListener('change', (e) => {
      this.showEvalBar = e.target.checked;
      const evalWrapper = document.getElementById('eval-bar-wrapper');
      if (evalWrapper) {
        evalWrapper.style.display = this.showEvalBar ? 'flex' : 'none';
      }
    });

    document.getElementById('toggle-threats')?.addEventListener('change', (e) => {
      this.showThreats = e.target.checked;
      this.updateUI();
    });

    // Copy Buttons
    document.getElementById('btn-copy-fen')?.addEventListener('click', () => {
      const fen = this.engine.exportFEN(this.state, this.turn);
      navigator.clipboard.writeText(fen);
      alert('FEN copied to clipboard!');
    });

    document.getElementById('btn-copy-pgn')?.addEventListener('click', () => {
      const pgn = this.moveHistory.map((m, i) => i % 2 === 0 ? `${Math.floor(i/2) + 1}. ${m.move}` : m.move).join(' ');
      navigator.clipboard.writeText(pgn);
      alert('PGN copied to clipboard!');
    });
  }

  handleSquareClick(index) {
    if (this.gameOver) return;

    // Check if player click is allowed in current mode
    const isPlayerTurn = 
      (this.gameMode === 'pvp') ||
      (this.gameMode === 'pve-white' && this.turn === 'white') ||
      (this.gameMode === 'pve-black' && this.turn === 'black');

    if (!isPlayerTurn) return;

    const clickedPiece = this.state[index];
    const isOwnPiece = clickedPiece && this.pieces.isWhite(clickedPiece) === (this.turn === 'white');

    if (this.selectedIndex !== null) {
      if (isOwnPiece) {
        this.selectSquare(index);
        return;
      }
      const move = this.legalMoves.find(m => m.to === index);
      if (move) {
        this.executeMove(move);
        return;
      }
      this.deselect();
    }

    if (isOwnPiece) {
      this.selectSquare(index);
    }
  }

  selectSquare(index) {
    if (this.selectedIndex === index) {
      this.deselect();
      return;
    }
    this.selectedIndex = index;
    this.legalMoves = this.engine.getLegalMoves(this.state, this.turn).filter(
      m => m.from === index
    );
    this.board.clearHighlights();
    this.board.highlightLegal(index, this.legalMoves);
  }

  deselect() {
    this.selectedIndex = null;
    this.legalMoves = [];
    this.board.clearHighlights();
    if (this.showThreats) {
      const threats = this.engine.getThreatMap(this.state);
      this.board.highlightThreats(threats);
    }
  }

  executeMove(move) {
    const { from, to, promotion } = move;
    const captured = this.state[to] || (move.enPassant ? (this.turn === 'white' ? 'p' : 'P') : null);

    // 1. Generate algebraic notation
    const notation = this.engine.parseAlgebraic(this.state, from, to, !!captured);

    // 2. Perform move
    const newState = this.engine.move(this.state, from, to, promotion);
    this.state = newState;
    this.engine.state = newState;
    this.historyStates.push([...newState]);

    // 3. Record move in history
    this.moveHistory.push({
      move: notation,
      from,
      to,
      captured: !!captured,
      promotion: !!promotion
    });
    this.engine.moveHistory.push({ from, to, promotion });

    // 4. Animate and render
    this.board.animateMove(from, to);
    this.pieces.drawPieces(this.board.container, this.state);

    // 5. Flip turn
    this.turn = this.turn === 'white' ? 'black' : 'white';
    this.selectedIndex = null;
    this.legalMoves = [];
    this.board.clearHighlights();

    // 6. Check state and update UI
    this.checkGameState();
    this.updateUI();

    // 7. Check if next turn is AI
    const nextIsAI = 
      (this.gameMode === 'pve-white' && this.turn === 'black') ||
      (this.gameMode === 'pve-black' && this.turn === 'white') ||
      (this.gameMode === 'eve');

    if (nextIsAI && !this.gameOver) {
      setTimeout(() => this.triggerAIMove(), 400);
    }
  }

  triggerAIMove() {
    if (this.gameOver) return;
    const aiMove = this.engine.findBestMove(this.state, this.turn, this.difficulty);
    if (aiMove) {
      this.executeMove(aiMove);
    }
  }

  selectMaster(masterId) {
    this.activeMaster = masterId;
    const master = MASTER_PROFILES[masterId] || MASTER_PROFILES.sunfish;

    // 1. Sync dropdown
    const selectEl = document.getElementById('master-select-dropdown');
    if (selectEl && selectEl.value !== masterId) {
      selectEl.value = masterId;
    }

    // 2. Sync master grid active class
    document.querySelectorAll('.master-card').forEach(card => {
      if (card.dataset.master === masterId) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });

    // 3. Update Active Guidelines Box
    const badgeEl = document.getElementById('master-badge');
    const quoteEl = document.getElementById('master-quote');
    const tipEl = document.getElementById('master-tip');
    if (badgeEl) badgeEl.textContent = `${master.avatar} ${master.name}`;
    if (quoteEl) quoteEl.textContent = master.quote;
    if (tipEl) tipEl.innerHTML = master.tip;

    // 4. Trigger move hint update
    this.showHint();
  }

  showHint() {
    if (this.gameOver) return;
    const hintInfo = this.engine.getBestMoveHint(this.state, this.turn, this.activeMaster);
    if (hintInfo && hintInfo.move) {
      this.board.clearHighlights();
      this.board.highlightHint(hintInfo.move);
      
      const fromSq = String.fromCharCode(97 + (hintInfo.move.from % 8)) + (8 - Math.floor(hintInfo.move.from / 8));
      const toSq = String.fromCharCode(97 + (hintInfo.move.to % 8)) + (8 - Math.floor(hintInfo.move.to / 8));
      
      const recEl = document.getElementById('ai-rec-move');
      if (recEl) recEl.textContent = `${fromSq} → ${toSq}`;

      const nodesEl = document.getElementById('ai-nodes');
      if (nodesEl) nodesEl.textContent = hintInfo.nodesSearched.toLocaleString();

      const summaryEl = document.getElementById('ai-summary');
      if (summaryEl && hintInfo.advice) {
        summaryEl.textContent = `${hintInfo.master.avatar} ${hintInfo.master.name}: "${hintInfo.advice}"`;
      }
    }
  }

  undoMove() {
    if (this.historyStates.length <= 1) return;

    // Undo 2 steps in PvE mode, or 1 step in PvP mode
    const stepsToUndo = (this.gameMode.startsWith('pve') && this.historyStates.length > 2) ? 2 : 1;

    for (let i = 0; i < stepsToUndo; i++) {
      if (this.historyStates.length > 1) {
        this.historyStates.pop();
        this.moveHistory.pop();
        this.state = this.engine.undoMove(this.state);
        this.turn = this.turn === 'white' ? 'black' : 'white';
      }
    }

    this.state = [...this.historyStates[this.historyStates.length - 1]];
    this.engine.state = this.state;
    this.gameOver = false;
    this.inCheck = false;
    this.inCheckmate = false;
    this.board.clearHighlights();
    this.pieces.drawPieces(this.board.container, this.state);
    this.updateUI();
  }

  checkGameState() {
    const activeColor = this.turn;
    const opponentColor = activeColor === 'white' ? 'black' : 'white';

    const activeInCheck = this.engine.isCheck(this.state, activeColor);
    const legalMoves = this.engine.getLegalMoves(this.state, activeColor);

    if (activeInCheck) {
      this.inCheck = true;
      if (legalMoves.length === 0) {
        this.inCheckmate = true;
        this.gameOver = true;
        this.showWinModal(opponentColor === 'white' ? 'White' : 'Black');
      }
    } else {
      this.inCheck = false;
      if (legalMoves.length === 0) {
        this.gameOver = true;
        this.showDrawModal('Stalemate');
      }
    }
  }

  showEndGameSummary(resultType, winnerName, reason) {
    const master = MASTER_PROFILES[this.activeMaster] || MASTER_PROFILES.sunfish;
    const moveCount = Math.floor(this.moveHistory.length / 2) + 1;
    const finalEval = this.engine.evaluatePosition(this.state, 'white');
    const evalFormatted = finalEval > 0 ? `+${finalEval.toFixed(2)}` : finalEval.toFixed(2);

    let titleText = '';
    let icon = '🏆';
    if (resultType === 'win') {
      titleText = `${winnerName} Wins by Checkmate!`;
      icon = winnerName === 'White' ? '♔' : '♚';
    } else {
      titleText = `Game Drawn (${reason})`;
      icon = '🤝';
    }

    // Master Post-Game Tactical Commentary
    let analysisText = '';
    if (this.activeMaster === 'carlsen') {
      analysisText = `Carlsen's Lens: The position was defined by central space control and flexible pawn structures over ${moveCount} moves. Final evaluation stood at ${evalFormatted} pawns.`;
    } else if (this.activeMaster === 'kasparov') {
      analysisText = `Kasparov's Lens: High initiative game with energetic piece development and space claims. Final evaluation reached ${evalFormatted} pawns over ${moveCount} moves.`;
    } else if (this.activeMaster === 'petrosian') {
      analysisText = `Petrosian's Lens: Prophylactic defensive play neutralized counter-threats. Game concluded in ${moveCount} moves with a score of ${evalFormatted} pawns.`;
    } else if (this.activeMaster === 'tal') {
      analysisText = `Tal's Lens: Sharp tactical complications and line openings created critical turning points during the ${moveCount}-move battle.`;
    } else if (this.activeMaster === 'morphy') {
      analysisText = `Morphy's Lens: Rapid piece development into central squares set the strategic pace across ${moveCount} moves.`;
    } else {
      analysisText = `Sunfish Engine Analysis: 120-mailbox Piece-Square Table calculation completed ${moveCount} moves with final evaluation of ${evalFormatted} pawns.`;
    }

    const modalEl = document.createElement('div');
    modalEl.className = 'modal-overlay';
    modalEl.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <div class="modal-header-icon">${icon}</div>
          <div class="modal-header-text">
            <h2>${titleText}</h2>
            <p>Game Summary & Post-Game Analysis</p>
          </div>
        </div>

        <div class="summary-stats-grid">
          <div class="summary-stat-card">
            <span class="summary-stat-label">Total Moves</span>
            <span class="summary-stat-val">${moveCount} Moves</span>
          </div>
          <div class="summary-stat-card">
            <span class="summary-stat-label">Final Evaluation</span>
            <span class="summary-stat-val">${evalFormatted} pawns</span>
          </div>
          <div class="summary-stat-card">
            <span class="summary-stat-label">Master Opponent</span>
            <span class="summary-stat-val">${master.avatar} ${master.name}</span>
          </div>
          <div class="summary-stat-card">
            <span class="summary-stat-label">Difficulty</span>
            <span class="summary-stat-val">${this.difficulty.toUpperCase()}</span>
          </div>
        </div>

        <div class="summary-analysis-box">
          <div class="summary-analysis-title">
            <span>🧠 ${master.name} Post-Game Analysis</span>
          </div>
          <div class="summary-analysis-body">${analysisText}</div>
        </div>

        <div class="modal-actions">
          <button class="btn btn-secondary btn-sm" id="modal-review-btn">📜 Review Moves</button>
          <button class="btn btn-secondary btn-sm" id="modal-pgn-btn">📋 Copy PGN</button>
          <button class="btn btn-primary btn-sm" id="modal-restart-btn">✨ Rematch</button>
        </div>
      </div>
    `;

    document.body.appendChild(modalEl);

    // Event Listeners
    document.getElementById('modal-restart-btn')?.addEventListener('click', () => {
      modalEl.remove();
      this.resetGame();
    });

    document.getElementById('modal-review-btn')?.addEventListener('click', () => {
      modalEl.remove();
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      document.querySelector('[data-tab="history"]')?.classList.add('active');
      document.getElementById('tab-history')?.classList.add('active');
    });

    document.getElementById('modal-pgn-btn')?.addEventListener('click', () => {
      const pgn = this.moveHistory.map((m, i) => i % 2 === 0 ? `${Math.floor(i/2) + 1}. ${m.move}` : m.move).join(' ');
      navigator.clipboard.writeText(pgn);
      alert('PGN copied to clipboard!');
    });
  }

  showWinModal(winner) {
    this.showEndGameSummary('win', winner, null);
  }

  showDrawModal(reason) {
    this.showEndGameSummary('draw', null, reason);
  }

  updateUI() {
    // 1. Turn status
    const turnEl = document.querySelector('.turn-indicator');
    if (turnEl) {
      turnEl.textContent = `${this.turn.charAt(0).toUpperCase() + this.turn.slice(1)}'s Turn`;
    }

    const checkEl = document.querySelector('.check-indicator');
    if (checkEl) checkEl.style.display = this.inCheck && !this.inCheckmate ? 'inline' : 'none';

    const mateEl = document.querySelector('.mate-indicator');
    if (mateEl) mateEl.style.display = this.inCheckmate ? 'inline' : 'none';

    // 2. Evaluation bar and Sunfish AI analysis
    const evalScore = this.engine.evaluatePosition(this.state, 'white');
    if (this.showEvalBar) {
      this.board.updateEvalBar(evalScore);
    }

    const aiEvalScoreEl = document.getElementById('ai-eval-score');
    if (aiEvalScoreEl) {
      const scoreStr = evalScore > 0 ? `+${evalScore.toFixed(2)}` : evalScore.toFixed(2);
      aiEvalScoreEl.textContent = `${scoreStr} pawns`;
    }

    const aiSummaryEl = document.getElementById('ai-summary');
    if (aiSummaryEl) {
      if (evalScore > 1.5) {
        aiSummaryEl.textContent = 'White has a strong positional advantage according to Sunfish PST evaluation.';
      } else if (evalScore < -1.5) {
        aiSummaryEl.textContent = 'Black controls the position with a significant material/positional lead.';
      } else {
        aiSummaryEl.textContent = 'The game is balanced. Focus on central control and piece mobility.';
      }
    }

    // 3. Move history log
    const historyEl = document.getElementById('move-history');
    if (historyEl) {
      historyEl.innerHTML = '';
      for (let i = 0; i < this.moveHistory.length; i += 2) {
        const row = document.createElement('div');
        row.className = 'history-row';
        const num = Math.floor(i / 2) + 1;
        const wMove = this.moveHistory[i].move;
        const bMove = this.moveHistory[i + 1] ? this.moveHistory[i + 1].move : '';
        row.innerHTML = `<span class="history-num">${num}.</span> <span class="history-move">${wMove}</span> <span class="history-move">${bMove}</span>`;
        historyEl.appendChild(row);
      }
      historyEl.scrollTop = historyEl.scrollHeight;
    }

    // 4. Threat map overlay
    if (this.showThreats) {
      const threats = this.engine.getThreatMap(this.state);
      this.board.highlightThreats(threats);
    }
  }

  clearCache() {
    // 1. Clear LocalStorage and SessionStorage
    localStorage.clear();
    sessionStorage.clear();

    // 2. Reset Sunfish Engine Transposition Table Cache
    if (this.engine && this.engine.sunfish) {
      this.engine.sunfish.tt.clear();
    }

    // 3. Unregister active service workers if any
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        for (let registration of registrations) {
          registration.unregister();
        }
      });
    }

    // 4. Force reload page from server without cache
    window.location.href = window.location.origin + window.location.pathname + '?t=' + Date.now();
  }

  resetGame() {
    this.engine = new ChessEngine();
    this.state = this.engine.generateBoard();
    this.historyStates = [[...this.state]];
    this.turn = 'white';
    this.selectedIndex = null;
    this.legalMoves = [];
    this.moveHistory = [];
    this.inCheck = false;
    this.inCheckmate = false;
    this.gameOver = false;

    this.board.render(this.state, this);
    this.pieces.drawPieces(this.board.container, this.state);
    this.updateUI();

    if ((this.gameMode === 'pve-black' || this.gameMode === 'eve') && this.turn === 'white') {
      setTimeout(() => this.triggerAIMove(), 500);
    }
  }
}

// Instantiate Global Game
window.game = new ChessGame();
