import Entity from './entity.js';

/* ---------- Platform osztály ---------- */
export default class Platform extends Entity {
	#path				// a plattform mozgásának útvonala
	#speed				// a plattform sebessége
	#currentTargetIndex	// a plattform útvonalán következő pontja
	#color

	get color() { return this.#color; }
	set color(col) { this.#color = col; }

	constructor(game, id, x, y, w = 160, h = 28, path = null, speed = 60) {
		super(game, id, x, y, w, h, 'platform');
		this.#path = path;
		this.#speed = speed;
		this.#currentTargetIndex = 0;
		this.#color = 'white'
	}

	update(dt) {
		super.update(dt);
		if (this.#path && this.#path.length > 0) {
			const t = this.#path[this.#currentTargetIndex];
			const dx = t.x - this.x;
			const dy = t.y - this.y;
			const dist = Math.hypot(dx, dy);	// = négyzetgyök(dx*dx + dy*dy) = távolság
			if (dist < 1) {
				this.#currentTargetIndex = (this.#currentTargetIndex + 1) % this.#path.length;
			} else {
				const nx = dx / dist; const ny = dy / dist;
				this.vel.x = nx * this.#speed;
				this.vel.y = ny * this.#speed;
			}
		}
	}

	render() {
		super.render()
		this.element.style.backgroundColor = this.#color
	}
}