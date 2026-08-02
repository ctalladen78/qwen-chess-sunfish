import { SunfishEngine } from './sunfish.js';

export const MASTER_PROFILES = {
  sunfish: {
    id: 'sunfish',
    name: 'Sunfish Engine',
    avatar: '🐟',
    tag: 'PST & Alpha-Beta',
    quote: '"Mathematical precision with 120-mailbox PST tables and alpha-beta search."',
    tip: '💡 Practice Principle: Control center squares early and optimize piece-square mobility.',
    depthMod: 4,
    advice: 'Sunfish recommends this move based on optimal Piece-Square Table positioning and deep calculation.'
  },
  kasparov: {
    id: 'kasparov',
    name: 'Garry Kasparov',
    avatar: '👑',
    tag: 'Dynamic Attack',
    quote: '"Attack! Seize the initiative and launch aggressive pawn storms."',
    tip: '💡 Practice Principle: Push pawns to create space and mobilize heavy pieces toward the enemy king.',
    depthMod: 4,
    advice: 'Kasparov recommends pushing into enemy territory to force defensive concessions and claim space!'
  },
  petrosian: {
    id: 'petrosian',
    name: 'Tigran Petrosian',
    avatar: '🛡️',
    tag: 'Iron Defense',
    quote: '"Prophylaxis first: eliminate opponent counterplay before advancing."',
    tip: '💡 Practice Principle: Protect key weak squares, maintain solid pawn chains, and neutralize threats.',
    depthMod: 4,
    advice: 'Petrosian advises securing key defensive outposts and blunting any potential opponent breakthroughs.'
  },
  carlsen: {
    id: 'carlsen',
    name: 'Magnus Carlsen',
    avatar: '🧠',
    tag: 'Precision Squeeze',
    quote: '"Relentless positional pressure: convert small edges into endgame wins."',
    tip: '💡 Practice Principle: Maximize active piece squares and squeeze position until the opponent blunders.',
    depthMod: 5,
    advice: 'Carlsen recommends placing pieces on their highest-activity squares to apply maximum positional squeeze.'
  },
  tal: {
    id: 'tal',
    name: 'Mikhail Tal',
    avatar: '⚡',
    tag: 'Tactical Magician',
    quote: '"You must take your opponent into a deep dark forest where 2+2=5."',
    tip: '💡 Practice Principle: Look for sharp piece sacrifices to blow open enemy king defenses.',
    depthMod: 4,
    advice: 'Tal recommends opening lines and creating tactical sharp play against the enemy monarch!'
  },
  morphy: {
    id: 'morphy',
    name: 'Paul Morphy',
    avatar: '📚',
    tag: 'Classical Development',
    quote: '"Help your pieces so they can help you! Rapid development is key."',
    tip: '💡 Practice Principle: Develop knights and bishops to central squares quickly before initiating attack.',
    depthMod: 3,
    advice: 'Morphy advises rapid piece mobilization into central control before launching your attack.'
  }
};

export class ChessEngine {
    constructor() {
        this.state = [];
        this.moveHistory = [];
        this.capturedPieces = { white: [], black: [] };
        this.sunfish = new SunfishEngine();
    }

    generateBoard() {
        const board = Array(64).fill(null);
        const initial = [
            'r', 'n', 'b', 'q', 'k', 'b', 'n', 'r',
            'p', 'p', 'p', 'p', 'p', 'p', 'p', 'p',
            null, null, null, null, null, null, null, null,
            null, null, null, null, null, null, null, null,
            null, null, null, null, null, null, null, null,
            null, null, null, null, null, null, null, null,
            'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P',
            'R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'
        ];
        for (let i = 0; i < 64; i++) {
            board[i] = initial[i];
        }
        this.state = board;
        this.moveHistory = [];
        this.capturedPieces = { white: [], black: [] };
        return board;
    }

    getSquare(row, col) {
        return row * 8 + col;
    }

    getRowCol(index) {
        return { row: Math.floor(index / 8), col: index % 8 };
    }

    getPiece(index) {
        return this.state[index];
    }

    setPiece(index, piece) {
        this.state[index] = piece;
    }

    isWhite(piece) {
        return piece === piece.toUpperCase();
    }

    isBlack(piece) {
        return piece === piece.toLowerCase();
    }

    getPieceColor(piece) {
        return this.isWhite(piece) ? 'white' : 'black';
    }

    generateInitialState() {
        return this.generateBoard();
    }

    hasMoved(square) {
        return this.moveHistory.some(move => move.from === square || move.to === square);
    }

    getLegalMoves(state, color) {
        const legalMoves = [];
        for (let i = 0; i < 64; i++) {
            const piece = state[i];
            if (!piece) continue;
            if (color && this.getPieceColor(piece) !== color) continue;

            const moves = this.getPieceMoves(state, i, piece);
            for (const move of moves) {
                const { from, to, promotion } = move;
                if (promotion) {
                    for (const promoPiece of ['Q', 'R', 'B', 'N']) {
                        const testState = [...state];
                        testState[from] = null;
                        testState[to] = promoPiece;
                        const inCheck = this.isCheck(testState, this.getPieceColor(promoPiece));
                        if (!inCheck) {
                            legalMoves.push({ from, to, promotion: promoPiece, isCastle: false });
                        }
                    }
                } else if (move.isCastle) {
                    legalMoves.push(move);
                } else {
                    const testState = [...state];
                    testState[from] = null;
                    testState[to] = piece;
                    const inCheck = this.isCheck(testState, this.getPieceColor(piece));
                    if (!inCheck) {
                        legalMoves.push(move);
                    }
                }
            }
        }
        return legalMoves;
    }

    getPieceMoves(state, index, piece) {
        const moves = [];
        const { row, col } = this.getRowCol(index);

        switch (piece.toLowerCase()) {
            case 'p':
                moves.push(...this.getPawnMoves(state, index, piece, row, col));
                break;
            case 'r':
                moves.push(...this.getRookMoves(state, index, piece, row, col));
                break;
            case 'n':
                moves.push(...this.getKnightMoves(state, index, piece, row, col));
                break;
            case 'b':
                moves.push(...this.getBishopMoves(state, index, piece, row, col));
                break;
            case 'q':
                moves.push(...this.getQueenMoves(state, index, piece, row, col));
                break;
            case 'k':
                moves.push(...this.getKingMoves(state, index, piece, row, col));
                break;
        }

        return moves;
    }

    getPawnMoves(state, index, piece, row, col) {
        const moves = [];
        const isWhite = this.isWhite(piece);
        const direction = isWhite ? -1 : 1;
        const startRow = isWhite ? 6 : 1;
        const opponent = isWhite ? 'p' : 'P';

        // 1. Forward move
        const nextRow = row + direction;
        if (nextRow >= 0 && nextRow < 8) {
            const forward = this.getSquare(nextRow, col);
            if (state[forward] === null) {
                if (nextRow === 0 || nextRow === 7) {
                    for (const promoPiece of ['Q', 'R', 'B', 'N']) {
                        moves.push({ from: index, to: forward, promotion: promoPiece });
                    }
                } else {
                    moves.push({ from: index, to: forward });
                }

                // Double push from start row
                if (row === startRow) {
                    const doubleForward = this.getSquare(row + 2 * direction, col);
                    if (state[doubleForward] === null) {
                        moves.push({ from: index, to: doubleForward });
                    }
                }
            }
        }

        // 2. Normal captures
        for (const dc of [-1, 1]) {
            const nextCol = col + dc;
            if (nextCol >= 0 && nextCol < 8 && nextRow >= 0 && nextRow < 8) {
                const captureSquare = this.getSquare(nextRow, nextCol);
                const target = state[captureSquare];
                if (target !== null && this.getPieceColor(target) !== this.getPieceColor(piece)) {
                    if (nextRow === 0 || nextRow === 7) {
                        for (const promoPiece of ['Q', 'R', 'B', 'N']) {
                            moves.push({ from: index, to: captureSquare, promotion: promoPiece });
                        }
                    } else {
                        moves.push({ from: index, to: captureSquare });
                    }
                }
            }
        }

        // 3. En passant
        if (this.moveHistory.length > 0) {
            const lastMove = this.moveHistory[this.moveHistory.length - 1];
            const lastMovePiece = state[lastMove.to];
            if (lastMovePiece && lastMovePiece.toLowerCase() === 'p') {
                const { row: lastFromRow } = this.getRowCol(lastMove.from);
                const { row: lastToRow, col: lastToCol } = this.getRowCol(lastMove.to);
                
                // Must be a double pawn push ending on the same row as our pawn
                if (Math.abs(lastFromRow - lastToRow) === 2 && lastToRow === row) {
                    if (Math.abs(lastToCol - col) === 1) {
                        const targetSquare = this.getSquare(row + direction, lastToCol);
                        moves.push({ from: index, to: targetSquare, enPassant: true });
                    }
                }
            }
        }

        return moves;
    }

    getRookMoves(state, index, piece, row, col) {
        const moves = [];
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

        for (const [dr, dc] of directions) {
            for (let i = 1; i < 8; i++) {
                const newRow = row + dr * i;
                const newCol = col + dc * i;
                if (newRow < 0 || newRow > 7 || newCol < 0 || newCol > 7) break;

                const square = this.getSquare(newRow, newCol);
                const target = state[square];

                if (target === null) {
                    moves.push({ from: index, to: square });
                } else {
                    if (this.getPieceColor(target) !== this.getPieceColor(piece)) {
                        moves.push({ from: index, to: square });
                    }
                    break;
                }
            }
        }

        return moves;
    }

    getKnightMoves(state, index, piece, row, col) {
        const moves = [];
        const offsets = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];

        for (const [dr, dc] of offsets) {
            const newRow = row + dr;
            const newCol = col + dc;
            if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                const square = this.getSquare(newRow, newCol);
                const target = state[square];
                if (target === null || this.getPieceColor(target) !== this.getPieceColor(piece)) {
                    moves.push({ from: index, to: square });
                }
            }
        }

        return moves;
    }

    getBishopMoves(state, index, piece, row, col) {
        const moves = [];
        const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];

        for (const [dr, dc] of directions) {
            for (let i = 1; i < 8; i++) {
                const newRow = row + dr * i;
                const newCol = col + dc * i;
                if (newRow < 0 || newRow > 7 || newCol < 0 || newCol > 7) break;

                const square = this.getSquare(newRow, newCol);
                const target = state[square];

                if (target === null) {
                    moves.push({ from: index, to: square });
                } else {
                    if (this.getPieceColor(target) !== this.getPieceColor(piece)) {
                        moves.push({ from: index, to: square });
                    }
                    break;
                }
            }
        }

        return moves;
    }

    getQueenMoves(state, index, piece, row, col) {
        const rookMoves = this.getRookMoves(state, index, piece, row, col);
        const bishopMoves = this.getBishopMoves(state, index, piece, row, col);
        return [...rookMoves, ...bishopMoves];
    }

    getKingMoves(state, index, piece, row, col) {
        const moves = [];
        const offsets = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];

        for (const [dr, dc] of offsets) {
            const newRow = row + dr;
            const newCol = col + dc;
            if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                const square = this.getSquare(newRow, newCol);
                const target = state[square];
                if (target === null || this.getPieceColor(target) !== this.getPieceColor(piece)) {
                    moves.push({ from: index, to: square });
                }
            }
        }

        // Castling
        const isWhite = this.isWhite(piece);
        const opponentColor = isWhite ? 'black' : 'white';
        if (!this.isCheck(state, isWhite ? 'white' : 'black')) {
            const kingStartSquare = isWhite ? 60 : 4;
            if (index === kingStartSquare && !this.hasMoved(kingStartSquare)) {
                // King-side castling
                const kingSideRook = isWhite ? 63 : 7;
                if (state[kingSideRook] === (isWhite ? 'R' : 'r') && !this.hasMoved(kingSideRook)) {
                    const f1 = isWhite ? 61 : 5;
                    const g1 = isWhite ? 62 : 6;
                    if (state[f1] === null && state[g1] === null) {
                        if (!this.isSquareAttacked(state, f1, opponentColor) && 
                            !this.isSquareAttacked(state, g1, opponentColor)) {
                            moves.push({ from: index, to: g1, isCastle: true, castleDir: 'king' });
                        }
                    }
                }

                // Queen-side castling
                const queenSideRook = isWhite ? 56 : 0;
                if (state[queenSideRook] === (isWhite ? 'R' : 'r') && !this.hasMoved(queenSideRook)) {
                    const d1 = isWhite ? 59 : 3;
                    const c1 = isWhite ? 58 : 2;
                    const b1 = isWhite ? 57 : 1;
                    if (state[d1] === null && state[c1] === null && state[b1] === null) {
                        if (!this.isSquareAttacked(state, d1, opponentColor) && 
                            !this.isSquareAttacked(state, c1, opponentColor)) {
                            moves.push({ from: index, to: c1, isCastle: true, castleDir: 'queen' });
                        }
                    }
                }
            }
        }

        return moves;
    }

    isSquareAttacked(state, square, byColor) {
        const { row, col } = this.getRowCol(square);
        const color = (byColor === 'w' || byColor === 'white') ? 'white' : 'black';

        // 1. Pawn attacks
        const pawn = color === 'white' ? 'P' : 'p';
        const attackerRowOffset = color === 'white' ? 1 : -1;
        for (const dc of [-1, 1]) {
            const r = row + attackerRowOffset;
            const c = col + dc;
            if (r >= 0 && r < 8 && c >= 0 && c < 8) {
                if (state[this.getSquare(r, c)] === pawn) return true;
            }
        }

        // 2. Knight attacks
        const knight = color === 'white' ? 'N' : 'n';
        const knightMoves = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        for (const [dr, dc] of knightMoves) {
            const r = row + dr;
            const c = col + dc;
            if (r >= 0 && r < 8 && c >= 0 && c < 8) {
                if (state[this.getSquare(r, c)] === knight) return true;
            }
        }

        // 3. King attacks
        const king = color === 'white' ? 'K' : 'k';
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const r = row + dr;
                const c = col + dc;
                if (r >= 0 && r < 8 && c >= 0 && c < 8) {
                    if (state[this.getSquare(r, c)] === king) return true;
                }
            }
        }

        // 4. Sliding pieces (Rook, Bishop, Queen)
        const dirs = [
            { dr: 0, dc: 1, type: 'orthogonal' },
            { dr: 0, dc: -1, type: 'orthogonal' },
            { dr: 1, dc: 0, type: 'orthogonal' },
            { dr: -1, dc: 0, type: 'orthogonal' },
            { dr: 1, dc: 1, type: 'diagonal' },
            { dr: 1, dc: -1, type: 'diagonal' },
            { dr: -1, dc: 1, type: 'diagonal' },
            { dr: -1, dc: -1, type: 'diagonal' }
        ];
        const rook = color === 'white' ? 'R' : 'r';
        const bishop = color === 'white' ? 'B' : 'b';
        const queen = color === 'white' ? 'Q' : 'q';

        for (const { dr, dc, type } of dirs) {
            for (let i = 1; i < 8; i++) {
                const r = row + dr * i;
                const c = col + dc * i;
                if (r < 0 || r > 7 || c < 0 || c > 7) break;

                const targetPiece = state[this.getSquare(r, c)];
                if (targetPiece !== null) {
                    if (targetPiece === queen) return true;
                    if (type === 'orthogonal' && targetPiece === rook) return true;
                    if (type === 'diagonal' && targetPiece === bishop) return true;
                    break;
                }
            }
        }

        return false;
    }

    isKing(piece) {
        return piece === 'K' || piece === 'k';
    }

    findKing(state, color) {
        const king = color === 'white' ? 'K' : 'k';
        for (let i = 0; i < 64; i++) {
            if (state[i] === king) return i;
        }
        return -1;
    }

    isCheck(state, color) {
        const kingIndex = this.findKing(state, color);
        if (kingIndex === -1) return false;
        return this.isSquareAttacked(state, kingIndex, color === 'white' ? 'black' : 'white');
    }

    isCheckmate(state, color) {
        const legalMoves = this.getLegalMoves(state, color);
        return legalMoves.length === 0 && this.isCheck(state, color);
    }

    isStalemate(state, color) {
        const legalMoves = this.getLegalMoves(state, color);
        return legalMoves.length === 0 && !this.isCheck(state, color);
    }

    move(state, from, to, promotion) {
        const testState = [...state];
        const piece = testState[from];
        const { row, col } = this.getRowCol(from);
        const { row: toRow, col: toCol } = this.getRowCol(to);

        testState[from] = null;

        if (promotion) {
            testState[to] = promotion;
        } else {
            testState[to] = piece;
        }

        // 1. En passant capture
        const isEnPassant = piece && piece.toLowerCase() === 'p' && col !== toCol && state[to] === null;
        if (isEnPassant) {
            const capturedSquare = this.getSquare(row, toCol);
            const capturedPiece = testState[capturedSquare];
            testState[capturedSquare] = null;
            if (capturedPiece) {
                this.capturedPieces[this.getPieceColor(piece) === 'white' ? 'black' : 'white'].push(capturedPiece);
            }
        } else {
            // Standard capture
            const capturedPiece = state[to];
            if (capturedPiece) {
                this.capturedPieces[this.getPieceColor(piece) === 'white' ? 'black' : 'white'].push(capturedPiece);
            }
        }

        // 2. Castling Rook move
        if (piece && piece.toLowerCase() === 'k' && Math.abs(col - toCol) === 2) {
            const isWhite = this.isWhite(piece);
            if (toCol === 6) {
                // King-side
                const rookFrom = isWhite ? 63 : 7;
                const rookTo = isWhite ? 61 : 5;
                testState[rookTo] = testState[rookFrom];
                testState[rookFrom] = null;
            } else if (toCol === 2) {
                // Queen-side
                const rookFrom = isWhite ? 56 : 0;
                const rookTo = isWhite ? 59 : 3;
                testState[rookTo] = testState[rookFrom];
                testState[rookFrom] = null;
            }
        }

        return testState;
    }

    parseAlgebraic(state, from, to, captured) {
        const { row: fromRow, col: fromCol } = this.getRowCol(from);
        const { row: toRow, col: toCol } = this.getRowCol(to);
        const piece = state[from];

        if (piece === null) return '';

        let notation = '';
        switch (piece.toLowerCase()) {
            case 'p':
                if (captured) {
                    const file = String.fromCharCode(97 + fromCol);
                    notation = `${file}x`;
                }
                break;
            case 'r':
                notation = 'R';
                break;
            case 'n':
                notation = 'N';
                break;
            case 'b':
                notation = 'B';
                break;
            case 'q':
                notation = 'Q';
                break;
            case 'k':
                notation = 'K';
                break;
        }

        if (captured && piece.toLowerCase() !== 'p') {
            notation += 'x';
        }

        notation += String.fromCharCode(97 + toCol) + (8 - toRow);

        // Castling
        if (piece === 'K' || piece === 'k') {
            if (Math.abs(fromCol - toCol) === 2) {
                if (toCol > fromCol) {
                    return 'O-O';
                } else {
                    return 'O-O-O';
                }
            }
        }

        // Check/checkmate
        const testState = this.move(state, from, to);
        const oppColor = this.getPieceColor(piece) === 'white' ? 'black' : 'white';
        if (this.isCheck(testState, oppColor)) {
            if (this.isCheckmate(testState, oppColor)) {
                notation += '#';
            } else {
                notation += '+';
            }
        }

        return notation;
    }

    findBestMove(state, color, difficulty = 'advanced') {
        const legalMoves = this.getLegalMoves(state, color);
        if (legalMoves.length === 0) return null;

        // Depth selection based on difficulty level
        let depth = 3;
        if (difficulty === 'beginner') depth = 1;
        else if (difficulty === 'intermediate') depth = 2;
        else if (difficulty === 'advanced') depth = 4;
        else if (difficulty === 'master') depth = 5;

        // Use Sunfish Engine search
        const result = this.sunfish.search(state, color, depth);
        if (result.move) {
            // Find corresponding legal move in engine rules
            const matchedMove = legalMoves.find(m => m.from === result.move.from && m.to === result.move.to);
            if (matchedMove) return matchedMove;
        }

        // Fallback to legal move evaluation if exact match not found
        let bestScore = -Infinity;
        let bestMove = legalMoves[0];
        for (const move of legalMoves) {
            const nextState = this.move(state, move.from, move.to, move.promotion);
            const score = this.evaluatePosition(nextState, color);
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        return bestMove;
    }

    getBestMoveHint(state, color, masterId = 'sunfish') {
        const legalMoves = this.getLegalMoves(state, color);
        if (legalMoves.length === 0) return null;

        const master = MASTER_PROFILES[masterId] || MASTER_PROFILES.sunfish;
        const depth = master.depthMod || 4;

        const result = this.sunfish.search(state, color, depth);
        let hintMove = null;

        if (result.move) {
            hintMove = legalMoves.find(m => m.from === result.move.from && m.to === result.move.to);
        }
        if (!hintMove) {
            hintMove = legalMoves[0];
        }

        return {
            move: hintMove,
            evalScore: result.score,
            nodesSearched: result.nodes,
            master: master,
            advice: master.advice
        };
    }

    evaluatePosition(state, color = 'white') {
        const mb = this.sunfish.toMailbox(state);
        const evalScore = this.sunfish.evaluate(mb) / 100;
        return color === 'white' ? evalScore : -evalScore;
    }

    getThreatMap(state) {
        const threats = { white: new Set(), black: new Set() };
        for (let i = 0; i < 64; i++) {
            const piece = state[i];
            if (!piece) continue;
            const pieceColor = this.getPieceColor(piece);
            const moves = this.getPieceMoves(state, i, piece);
            for (const m of moves) {
                threats[pieceColor].add(m.to);
            }
        }
        return threats;
    }

    exportFEN(state, turn = 'white') {
        let fen = '';
        for (let r = 0; r < 8; r++) {
            let empty = 0;
            for (let c = 0; c < 8; c++) {
                const p = state[r * 8 + c];
                if (!p) {
                    empty++;
                } else {
                    if (empty > 0) {
                        fen += empty;
                        empty = 0;
                    }
                    fen += p;
                }
            }
            if (empty > 0) fen += empty;
            if (r < 7) fen += '/';
        }
        fen += ` ${turn.charAt(0)} KQkq - 0 ${Math.floor(this.moveHistory.length / 2) + 1}`;
        return fen;
    }

    undoMove(state) {
        if (this.moveHistory.length === 0) return state;

        const lastMove = this.moveHistory[this.moveHistory.length - 1];
        const { from, to, promotion, captured } = lastMove;

        const newState = [...state];
        newState[to] = null;
        newState[from] = state[to];

        if (captured) {
            const capturedSquare = this.getSquare(this.getRowCol(to).row, this.getRowCol(from).col);
            newState[capturedSquare] = captured;
        }

        this.moveHistory.pop();
        return newState;
    }
}
