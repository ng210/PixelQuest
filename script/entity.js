/* ---------- Entity: alap osztály minden játékobjekthez ---------- */
export default class Entity {
	constructor(game, x, y, w, h, className) {
		this.game = game;
		this.x = x; this.y = y; this.w = w; this.h = h;
		this.vx = 0; this.vy = 0;
		this.el = document.createElement('div');
		this.el.className = 'entity ' + (className || '');
		this.game.worldEl.appendChild(this.el);
		this.updateDom();
	}
	update(dt) {
		// alap mozgás
		this.x += this.vx * dt;
		this.y += this.vy * dt;
	}
	updateDom() {
		// központosan használjuk transformot a gyors render érdekében
		this.el.style.transform = `translate(${this.x}px, ${this.y}px)`;
		this.el.style.width = this.w + 'px';
		this.el.style.height = this.h + 'px';
	}
	getBounds() { return { x: this.x, y: this.y, w: this.w, h: this.h }; }
	destroy() {
		if (this.el && this.el.parentNode) this.el.parentNode.removeChild(this.el);
	}
}