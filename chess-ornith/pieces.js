export const PIECE_SVG = {
  white: {
    K: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <g fill="#f8fafc" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 32c8-14 26-16 38-4l6-8v24l-6-8c-12 12-30 10-38-4z"/>
        <path d="M30 18c4-8 12-10 16-6"/>
        <path d="M30 46c4 8 12 10 16 6"/>
        <path d="M26 34c4-2 8 0 10 4s-4 6-10 4z"/>
        <circle cx="20" cy="28" r="3" fill="#0f172a"/>
        <path d="M16 16l4 4 4-4 4 4 4-4v6H16z" fill="#f8fafc"/>
      </g>
    </svg>`,
    Q: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <g fill="#f8fafc" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="16" cy="16" r="2.5"/><circle cx="24" cy="12" r="2.5"/><circle cx="32" cy="10" r="2.5"/><circle cx="40" cy="12" r="2.5"/><circle cx="48" cy="16" r="2.5"/>
        <path d="M16 19.5l4 16.5h24l4-16.5-8 10-8-15-8 15z"/>
        <path d="M20 40h24v6H20zM17 48h30v6H17z"/>
      </g>
    </svg>`,
    R: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <g fill="#f8fafc" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 14h6v6h8v-6h8v6h6v-6h3v12H15V14z"/>
        <path d="M21 26h22l-2 14H23z"/>
        <path d="M20 40h24v6H20zM17 48h30v6H17z"/>
      </g>
    </svg>`,
    B: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <g fill="#f8fafc" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="32" cy="10" r="3"/>
        <path d="M32 13c-5.5 0-10 4.5-10 11 0 5 3.5 9 8 10.5V38h4v-3.5c4.5-1.5 8-5.5 8-10.5 0-6.5-4.5-11-10-11z"/>
        <path d="M28 20l8 8M36 20l-8 8"/>
        <path d="M20 40h24v6H20zM17 48h30v6H17z"/>
      </g>
    </svg>`,
    N: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <g fill="#f8fafc" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M 21 12 L 20 6 L 25 9 L 29 4 L 32 10 C 40 12 51 20 53 34 C 54 43 54 52 54 54 L 18 54 C 18 48 22 41 30 35 C 33 32 34 27 31 23 C 28 27 25 32 20 37 C 16 41 12 42 9 38 C 6 34 8 27 13 20 C 16 16 19 13 21 12 Z"/>
        <ellipse cx="23" cy="21" rx="1.5" ry="3" transform="rotate(-25 23 21)" fill="#0f172a"/>
        <circle cx="12" cy="36" r="1.5" fill="#0f172a"/>
        <path d="M 14 41 C 16 43 18 41 19 39"/>
      </g>
    </svg>`,
    P: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <g fill="#f8fafc" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="32" cy="16" r="8"/>
        <path d="M24 26c0 6 3 10 8 12s8-6 8-12H24z"/>
        <path d="M21 38h22v6H21zM18 46h28v6H18z"/>
      </g>
    </svg>`
  },
  black: {
    K: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <g fill="#0f172a" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 32c8-14 26-16 38-4l6-8v24l-6-8c-12 12-30 10-38-4z"/>
        <path d="M30 18c4-8 12-10 16-6"/>
        <path d="M30 46c4 8 12 10 16 6"/>
        <path d="M26 34c4-2 8 0 10 4s-4 6-10 4z"/>
        <circle cx="20" cy="28" r="3" fill="#38bdf8"/>
        <path d="M16 16l4 4 4-4 4 4 4-4v6H16z" fill="#0f172a"/>
      </g>
    </svg>`,
    Q: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <g fill="#0f172a" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="16" cy="16" r="2.5"/><circle cx="24" cy="12" r="2.5"/><circle cx="32" cy="10" r="2.5"/><circle cx="40" cy="12" r="2.5"/><circle cx="48" cy="16" r="2.5"/>
        <path d="M16 19.5l4 16.5h24l4-16.5-8 10-8-15-8 15z"/>
        <path d="M20 40h24v6H20zM17 48h30v6H17z"/>
      </g>
    </svg>`,
    R: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <g fill="#0f172a" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 14h6v6h8v-6h8v6h6v-6h3v12H15V14z"/>
        <path d="M21 26h22l-2 14H23z"/>
        <path d="M20 40h24v6H20zM17 48h30v6H17z"/>
      </g>
    </svg>`,
    B: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <g fill="#0f172a" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="32" cy="10" r="3"/>
        <path d="M32 13c-5.5 0-10 4.5-10 11 0 5 3.5 9 8 10.5V38h4v-3.5c4.5-1.5 8-5.5 8-10.5 0-6.5-4.5-11-10-11z"/>
        <path d="M28 20l8 8M36 20l-8 8"/>
        <path d="M20 40h24v6H20zM17 48h30v6H17z"/>
      </g>
    </svg>`,
    N: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <g fill="#0f172a" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M 21 12 L 20 6 L 25 9 L 29 4 L 32 10 C 40 12 51 20 53 34 C 54 43 54 52 54 54 L 18 54 C 18 48 22 41 30 35 C 33 32 34 27 31 23 C 28 27 25 32 20 37 C 16 41 12 42 9 38 C 6 34 8 27 13 20 C 16 16 19 13 21 12 Z"/>
        <ellipse cx="23" cy="21" rx="1.5" ry="3" transform="rotate(-25 23 21)" fill="#38bdf8"/>
        <circle cx="12" cy="36" r="1.5" fill="#38bdf8"/>
        <path d="M 14 41 C 16 43 18 41 19 39"/>
      </g>
    </svg>`,
    P: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <g fill="#0f172a" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="32" cy="16" r="8"/>
        <path d="M24 26c0 6 3 10 8 12s8-6 8-12H24z"/>
        <path d="M21 38h22v6H21zM18 46h28v6H18z"/>
      </g>
    </svg>`
  }
};

export class ChessPieces {
  constructor() {
    this.currentColor = 'white';
  }

  drawPieceSVG(piece) {
    if (!piece) return '';
    const color = this.isWhite(piece) ? 'white' : 'black';
    const upperPiece = piece.toUpperCase();
    const svg = PIECE_SVG[color] ? PIECE_SVG[color][upperPiece] : null;
    return svg || '';
  }

  isWhite(piece) {
    return piece && piece === piece.toUpperCase();
  }

  isBlack(piece) {
    return piece && piece === piece.toLowerCase();
  }

  drawPieces(container, state) {
    for (let i = 0; i < 64; i++) {
      const squareEl = container.querySelector(`[data-index="${i}"]`);
      if (squareEl) {
        const oldPiece = squareEl.querySelector('.piece');
        if (oldPiece) oldPiece.remove();

        const piece = state[i];
        if (piece) {
          const pieceEl = document.createElement('div');
          pieceEl.className = `piece ${this.isWhite(piece) ? 'piece-white' : 'piece-black'}`;
          pieceEl.innerHTML = this.drawPieceSVG(piece);
          squareEl.appendChild(pieceEl);
        }
      }
    }
  }

  updateTurnIndicator(container) {
    const turnEl = container.querySelector('.turn-indicator');
    if (turnEl) {
      turnEl.textContent = `White's Turn`;
    }
    this.currentColor = 'white';
  }

  flipTurn() {
    this.currentColor = this.currentColor === 'white' ? 'black' : 'white';
  }
}
