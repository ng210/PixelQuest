import Entity from './entity.js';

/* ---------- Platform osztály ---------- */
export default class Platform extends Entity {
	#path				// a plattform mozgásának útvonala
	#speed				// a plattform sebessége
	#currentTargetIndex	// a plattform útvonalán következő pontja
	#color

	get color() { return this.#color }
	set color(col) { this.#color = col }

	constructor(id, x, y, w = 160, h = 28, path = null, speed = 60) {
		super(id, x, y, w, h);
		this.mass = 100
		this.#path = null
		this.addPath(path)
		this.#speed = speed
		this.#currentTargetIndex = 0
	}

	addPath(path) {
		if (path != null) {
			if (this.#path == null) {
				this.#path = []
				this.#path.push({ x:this.position.x, y:this.position.y })
			}
			let x = this.position.x, y = this.position.y
			for (let delta of path) {
				x += delta.dx
				y += delta.dy
				this.#path.push({ x, y })
			}
		}
	}

	update(dt) {
		super.update(dt);
		if (this.#path && this.#path.length > 0) {
			const t1 = this.#path[this.#currentTargetIndex]
			const t2 = this.#path[(this.#currentTargetIndex + 1) % this.#path.length]
			const tx = t2.x - t1.x
			const ty = t2.y - t1.y
			const dx = t2.x - this.position.x
			const dy = t2.y - this.position.y
			
			if ((tx > 0 && dx < 0) || (tx < 0 && dx > 0)) {
				this.#currentTargetIndex = (this.#currentTargetIndex + 1) % this.#path.length
			}

			if ((ty > 0 && dy < 0) || (ty < 0 && dy > 0)) {
				this.#currentTargetIndex = (this.#currentTargetIndex + 1) % this.#path.length
			}

			this.velocity.x = Math.sign(tx) * this.#speed
			this.velocity.y = Math.sign(ty) * this.#speed
		}
	}

	// render() {
	// 	super.render()
	// 	this.element.style.backgroundColor = this.#color
	// }
}