/**
 * Sunfish Chess Engine JS Port
 * Based on Thomas Ahle's Sunfish Engine.
 * Provides fast 120-mailbox board evaluation, piece-square tables,
 * alpha-beta search, quiescence search, and Zobrist Transposition Table.
 */

// 120 Mailbox board constants
const N = -10, E = 1, S = 10, W = -1;
const A8 = 21, H8 = 28, A1 = 91, H1 = 98;

const PIECE_VALUES = { P: 100, N: 280, B: 320, R: 479, Q: 929, K: 60000 };

const PST_BASE = {
  P: [
      0,   0,   0,   0,   0,   0,   0,   0,
     78,  83,  86,  73, 102,  82,  85,  90,
      7,  29,  21,  44,  40,  31,  44,   7,
    -17,  16,  -2,  15,  14,   0,  15, -13,
    -26,   3,  10,   9,   6,   1,   0, -23,
    -22,   9,   5, -11, -10,  -2,   3, -19,
    -31,   8,  -7, -37, -36, -14,   3, -31,
      0,   0,   0,   0,   0,   0,   0,   0
  ],
  N: [
    -66, -53, -75, -75, -10, -55, -58, -70,
     -3,  -6, 100, -36,   4,  62,  -4, -14,
     10,  67,   1,  74,  73,  27,  62,  -2,
     24,  24,  45,  37,  33,  41,  25,  17,
     -1,   5,  31,  21,  22,  35,   2,   0,
    -18,  10,  13,  22,  18,  15,  11, -14,
    -23, -15,   2,   0,   2,   0, -23, -20,
    -74, -23, -26, -24, -19, -35, -22, -69
  ],
  B: [
    -59, -78, -82, -76, -23,-107, -37, -50,
    -11,  20,  35, -42, -39,  31,   2, -22,
     -9,  39, -32,  41,  52, -10,  28, -14,
     25,  17,  20,  34,  26,  25,  15,  10,
     13,  10,  17,  23,  17,  16,   0,   7,
     14,  25,  24,  15,   8,  25,  20,  15,
     19,  20,  11,   6,   7,   6,  20,  16,
     -7,   2, -15, -12, -14, -15, -10, -10
  ],
  R: [
     35,  29,  33,   4,  37,  33,  56,  50,
     55,  29,  56,  67,  55,  62,  34,  60,
     19,  35,  28,  33,  45,  27,  25,  15,
      0,   5,  16,  13,  18,  -4,  -9,  -6,
    -28, -35, -16, -21, -13, -29, -46, -30,
    -42, -28, -42, -25, -25, -35, -26, -46,
    -53, -38, -31, -26, -29, -43, -44, -53,
    -30, -24, -18,   5,  -2, -18, -31, -32
  ],
  Q: [
      6,   1,  -8,-104,  69,  24,  88,  26,
     14,  32,  60, -10,  20,  76,  57,  24,
     -2,  43,  32,  60,  72,  63,  43,   2,
      1, -16,  22,  17,  25,  20, -13,  -6,
    -14, -15,  -2,  -5,  -1, -10, -20, -22,
    -30,  -6, -13, -11, -16, -11, -16, -27,
    -36, -18,   0, -19, -15, -15, -21, -38,
    -39, -30, -31, -13, -31, -36, -34, -42
  ],
  K: [
      4,  54,  47, -99, -99,  60,  83, -62,
    -32,  10,  55,  56,  56,  55,  10,   3,
    -62,  12, -57,  44, -67,  28,  37, -31,
    -55,  50,  11,  -4, -19,  13,   0, -49,
    -55, -43, -52, -28, -51, -47,  -8, -50,
    -47, -42, -43, -79, -64, -32, -29, -32,
     -4,   3, -14, -50, -57, -18,  13,   4,
     17,  30,  -3, -14,   6,  -1,  40,  18
  ]
};

// Build padded 120-mailbox PST tables
const PST = {};
for (const [piece, table] of Object.entries(PST_BASE)) {
  const padded = new Array(120).fill(0);
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const idx120 = 21 + r * 10 + c;
      const val = table[r * 8 + c] + PIECE_VALUES[piece];
      padded[idx120] = val;
    }
  }
  PST[piece] = padded;
}

const DIRECTIONS = {
  P: [N, N + N, N + W, N + E],
  N: [N + N + E, E + N + E, E + S + E, S + S + E, S + S + W, W + S + W, W + N + W, N + N + W],
  B: [N + E, S + E, S + W, N + W],
  R: [N, E, S, W],
  Q: [N, E, S, W, N + E, S + E, S + W, N + W],
  K: [N, E, S, W, N + E, S + E, S + W, N + W]
};

const MATE_LOWER = PIECE_VALUES.K - 10 * PIECE_VALUES.Q;
const MATE_UPPER = PIECE_VALUES.K + 10 * PIECE_VALUES.Q;

export class SunfishEngine {
  constructor() {
    this.tt = new Map();
    this.nodes = 0;
  }

  // Convert 8x8 array (64 elements) to 120-mailbox string format
  toMailbox(board64) {
    let mb = new Array(120).fill(' ');
    for (let i = 0; i < 64; i++) {
      const r = Math.floor(i / 8);
      const c = i % 8;
      const mIdx = 21 + r * 10 + c;
      mb[mIdx] = board64[i] || '.';
    }
    return mb.join('');
  }

  // Convert 120-mailbox index to 8x8 index (0..63)
  mTo64(mIdx) {
    const r = Math.floor(mIdx / 10) - 2;
    const c = (mIdx % 10) - 1;
    return r * 8 + c;
  }

  // Convert 8x8 index (0..63) to 120-mailbox index
  i64ToM(i64) {
    const r = Math.floor(i64 / 8);
    const c = i64 % 8;
    return 21 + r * 10 + c;
  }

  // Calculate static evaluation score for White relative to Black
  evaluate(boardStr) {
    let score = 0;
    for (let i = 21; i <= 98; i++) {
      const ch = boardStr[i];
      if (ch === ' ' || ch === '.') continue;
      const upper = ch.toUpperCase();
      const val = PST[upper] ? PST[upper][i] : 0;
      if (ch === upper) {
        score += val;
      } else {
        // Rotate square for Black evaluation
        const r = Math.floor(i / 10) - 2;
        const c = (i % 10) - 1;
        const rotIdx = 21 + (7 - r) * 10 + c;
        const rotVal = PST[upper] ? PST[upper][rotIdx] : 0;
        score -= rotVal;
      }
    }
    return score;
  }

  // Generate legal pseudo-moves in Mailbox representation
  genMoves(boardStr, color) {
    const moves = [];
    const isWhite = color === 'white';

    for (let i = 21; i <= 98; i++) {
      const p = boardStr[i];
      if (p === ' ' || p === '.') continue;
      if (isWhite ? !p.match(/[A-Z]/) : !p.match(/[a-z]/)) continue;

      const upperP = p.toUpperCase();
      const pDirs = DIRECTIONS[upperP];
      if (!pDirs) continue;

      for (const d of pDirs) {
        let step = 0;
        for (let j = i + d; ; j += d) {
          step++;
          const q = boardStr[j];
          if (q === ' ') break; // Off board
          if (isWhite ? q.match(/[A-Z]/) : q.match(/[a-z]/)) break; // Friendly piece

          // Pawn movement rules
          if (upperP === 'P') {
            const isNorth = d === N || d === N + N;
            const isSouth = d === S || d === S + S;
            const isForward = isWhite ? isNorth : isSouth;
            const isDouble = d === (isWhite ? N + N : S + S);

            if (isForward) {
              if (q !== '.') break;
              if (isDouble) {
                const startRow = isWhite ? 8 : 3; // In 120-mailbox: rank 2 is row 8 (81..88), rank 7 is row 3 (31..38)
                const curRow = Math.floor(i / 10);
                if (curRow !== startRow) break;
                const midSq = boardStr[i + (isWhite ? N : S)];
                if (midSq !== '.') break;
              }
            } else {
              // Diagonal capture
              if (q === '.') break;
            }
          }

          // Pawn promotion check
          const destRow = Math.floor(j / 10);
          const isProm = upperP === 'P' && (destRow === 2 || destRow === 9);

          if (isProm) {
            moves.push({ from: i, to: j, promotion: isWhite ? 'Q' : 'q' });
          } else {
            moves.push({ from: i, to: j, promotion: null });
          }

          if (q !== '.') break; // Capture stops sliding pieces
          if (upperP === 'P' || upperP === 'N' || upperP === 'K') break; // Single step pieces
        }
      }
    }

    return moves;
  }

  // Make move on board string
  makeMove(boardStr, move) {
    const chars = boardStr.split('');
    const p = chars[move.from];
    chars[move.from] = '.';
    chars[move.to] = move.promotion || p;
    return chars.join('');
  }

  // Quiescence search to evaluate capture sequences
  quiescence(boardStr, alpha, beta, color) {
    this.nodes++;
    const isWhite = color === 'white';
    const staticEval = isWhite ? this.evaluate(boardStr) : -this.evaluate(boardStr);

    if (staticEval >= beta) return beta;
    if (staticEval > alpha) alpha = staticEval;

    const moves = this.genMoves(boardStr, color).filter(m => boardStr[m.to] !== '.');
    // Sort captures by victim value
    moves.sort((a, b) => {
      const valA = PIECE_VALUES[boardStr[a.to].toUpperCase()] || 0;
      const valB = PIECE_VALUES[boardStr[b.to].toUpperCase()] || 0;
      return valB - valA;
    });

    const nextColor = isWhite ? 'black' : 'white';
    for (const move of moves) {
      const nextBoard = this.makeMove(boardStr, move);
      const score = -this.quiescence(nextBoard, -beta, -alpha, nextColor);
      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    }

    return alpha;
  }

  // Minimax with Alpha-Beta Pruning
  searchAlphaBeta(boardStr, depth, alpha, beta, color) {
    this.nodes++;
    const isWhite = color === 'white';
    const ttKey = `${boardStr}_${depth}_${color}`;

    if (this.tt.has(ttKey)) {
      return this.tt.get(ttKey);
    }

    if (depth <= 0) {
      const val = this.quiescence(boardStr, alpha, beta, color);
      return { score: val, move: null };
    }

    const moves = this.genMoves(boardStr, color);
    if (moves.length === 0) {
      const kingChar = isWhite ? 'K' : 'k';
      const inCheck = boardStr.includes(kingChar);
      return { score: inCheck ? -MATE_UPPER + (5 - depth) : 0, move: null };
    }

    // Move ordering: captures first
    moves.sort((a, b) => (boardStr[b.to] !== '.' ? 1 : 0) - (boardStr[a.to] !== '.' ? 1 : 0));

    let bestMove = moves[0];
    let bestScore = -Infinity;
    const nextColor = isWhite ? 'black' : 'white';

    for (const move of moves) {
      const nextBoard = this.makeMove(boardStr, move);
      const res = this.searchAlphaBeta(nextBoard, depth - 1, -beta, -alpha, nextColor);
      const score = -res.score;

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
      if (score > alpha) {
        alpha = score;
      }
      if (alpha >= beta) {
        break; // Alpha-beta cutoff
      }
    }

    const result = { score: bestScore, move: bestMove };
    this.tt.set(ttKey, result);
    return result;
  }

  // Main entry point to get best move from 8x8 array state
  search(board64, color, depth = 3) {
    this.nodes = 0;
    this.tt.clear();
    const boardStr = this.toMailbox(board64);

    const result = this.searchAlphaBeta(boardStr, depth, -Infinity, Infinity, color);

    let move64 = null;
    if (result.move) {
      move64 = {
        from: this.mTo64(result.move.from),
        to: this.mTo64(result.move.to),
        promotion: result.move.promotion
      };
    }

    const evalScore = color === 'white' ? result.score : -result.score;

    return {
      move: move64,
      score: evalScore / 100, // Pawn units
      nodes: this.nodes
    };
  }
}
