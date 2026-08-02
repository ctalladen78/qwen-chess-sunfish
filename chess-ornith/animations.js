export class ChessAnimations {
  constructor(scene) {
    this.scene = scene;
    this.moveQueue = [];
    this.animating = false;
    this.animationFrame = null;
  }

  enqueueMove(fromIndex, toIndex) {
    this.moveQueue.push({ from: fromIndex, to: toIndex });
    this.startAnimation();
  }

  startAnimation() {
    if (this.moveQueue.length === 0) return;
    if (this.animating) return;
    this.animating = true;
    this.animateNext();
  }

  animateNext() {
    if (this.moveQueue.length === 0) {
      this.animating = false;
      return;
    }
    const move = this.moveQueue.shift();
    const fromEl = this.scene.board.querySelector(`[data-index="${move.from}"]`);
    const toEl = this.scene.board.querySelector(`[data-index="${move.to}"]`);
    if (!fromEl || !toEl) return;

    const fromRect = fromEl.getBoundingClientRect();
    const toRect = toEl.getBoundingClientRect();

    const startX = fromRect.left + fromRect.width / 2;
    const startY = fromRect.top + fromRect.height / 2;
    const endX = toRect.left + toRect.width / 2;
    const endY = toRect.top + toRect.height / 2;

    const duration = 250;
    const startTime = performance.now();
    const piece = fromEl.querySelector('svg');

    fromEl.style.transition = 'none';
    fromEl.style.transform = 'translate(0, 0)';
    fromEl.style.opacity = '1';

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      const curX = startX + (endX - startX) * eased;
      const curY = startY + (endY - startY) * eased;

      fromEl.style.transform = `translate(${curX - startX}px, ${curY - startY}px)`;

      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(animate);
      } else {
        fromEl.style.transform = 'none';
        fromEl.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
        fromEl.style.opacity = '0';

        setTimeout(() => {
          fromEl.remove();
          if (piece) {
            toEl.insertAdjacentHTML('beforebegin', `<div class="piece" data-index="${move.to}">${piece.innerHTML}</div>`);
          }
        }, 200);

        this.animationFrame = requestAnimationFrame(() => this.animateNext());
      }
    };

    this.animationFrame = requestAnimationFrame(animate);
  }

  flashSquare(index, color) {
    const el = this.scene.board.querySelector(`[data-index="${index}"]`);
    if (!el) return;
    const originalBg = el.style.background;
    el.style.background = color;
    setTimeout(() => {
      el.style.background = originalBg;
    }, 400);
  }
}
