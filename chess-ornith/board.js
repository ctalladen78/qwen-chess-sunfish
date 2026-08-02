export class BoardRenderer {
  constructor() {
    this.container = document.getElementById('board');
    this.flipped = false;
    this.evalBarFill = null;
    this.evalBarText = null;
  }

  render(state, game) {
    if (this.container.querySelectorAll('.square').length === 0) {
      this.container.innerHTML = '';
      
      const boardInfo = document.createElement('div');
      boardInfo.className = 'board-info';
      boardInfo.innerHTML = `
        <div class="captured-white" id="captured-white"></div>
        <div class="captured-black" id="captured-black"></div>
      `;
      this.container.appendChild(boardInfo);

      for (let idx = 0; idx < 64; idx++) {
        const i = this.flipped ? 63 - idx : idx;
        const square = document.createElement('div');
        const row = Math.floor(i / 8);
        const col = i % 8;
        const isLight = (row + col) % 2 === 0;
        
        square.className = `square ${isLight ? 'light' : 'dark'}`;
        square.dataset.index = i;

        // Rank / File coordinates labels
        if (col === 0) {
          const rankLabel = document.createElement('span');
          rankLabel.className = 'coord-rank';
          rankLabel.textContent = 8 - row;
          square.appendChild(rankLabel);
        }
        if (row === 7) {
          const fileLabel = document.createElement('span');
          fileLabel.className = 'coord-file';
          fileLabel.textContent = String.fromCharCode(97 + col);
          square.appendChild(fileLabel);
        }

        square.addEventListener('click', () => {
          game.handleSquareClick(i);
        });

        this.container.appendChild(square);
      }
    }
  }

  flipBoard(state, game) {
    this.flipped = !this.flipped;
    this.container.innerHTML = '';
    this.render(state, game);
    game.pieces.drawPieces(this.container, state);
  }

  clearHighlights() {
    const squares = this.container.querySelectorAll('.square');
    squares.forEach(sq => {
      sq.classList.remove('legal-target', 'selected', 'highlighted', 'hint-from', 'hint-to', 'threat-white', 'threat-black');
    });
  }

  highlightLegal(index, legalMoves) {
    const selectedSq = this.container.querySelector(`[data-index="${index}"]`);
    if (selectedSq) {
      selectedSq.classList.add('selected');
    }

    legalMoves.forEach(move => {
      const destSq = this.container.querySelector(`[data-index="${move.to}"]`);
      if (destSq) {
        destSq.classList.add('legal-target');
      }
    });
  }

  highlightHint(hintMove) {
    if (!hintMove) return;
    const fromSq = this.container.querySelector(`[data-index="${hintMove.from}"]`);
    const toSq = this.container.querySelector(`[data-index="${hintMove.to}"]`);
    if (fromSq) fromSq.classList.add('hint-from');
    if (toSq) toSq.classList.add('hint-to');
  }

  highlightThreats(threats) {
    if (!threats) return;
    threats.white.forEach(idx => {
      const sq = this.container.querySelector(`[data-index="${idx}"]`);
      if (sq) sq.classList.add('threat-white');
    });
    threats.black.forEach(idx => {
      const sq = this.container.querySelector(`[data-index="${idx}"]`);
      if (sq) sq.classList.add('threat-black');
    });
  }

  updateEvalBar(evalScore) {
    const evalFill = document.getElementById('eval-bar-fill');
    const evalText = document.getElementById('eval-bar-text');
    if (!evalFill || !evalText) return;

    // Convert eval score (-10 to +10 range) to percentage (0% = Black win, 50% = equal, 100% = White win)
    const cappedScore = Math.max(-10, Math.min(10, evalScore));
    const whitePct = Math.min(100, Math.max(0, 50 + cappedScore * 5));

    evalFill.style.height = `${whitePct}%`;

    const scoreFormatted = evalScore > 0 ? `+${evalScore.toFixed(1)}` : evalScore.toFixed(1);
    evalText.textContent = scoreFormatted;
  }

  animateMove(from, to) {
    const toSq = this.container.querySelector(`[data-index="${to}"]`);
    if (toSq) {
      toSq.style.transform = 'scale(0.85)';
      setTimeout(() => {
        toSq.style.transform = 'none';
      }, 150);
    }
  }

  querySelector(selector) {
    return this.container.querySelector(selector);
  }
}
