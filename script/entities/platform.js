import Entity from './entity.js';

/* ---------- Platform osztály ---------- */
export default class Platform extends Entity {
	#path				// a plattform mozgásának útvonala
	#speed				// a plattform sebessége
	#currentTargetIndex	// a plattform útvonalán következő pontja
	#color
	#subtype

	get color() { return this.#color; }
	set color(col) { this.#color = col; }

	constructor(game, id, subtype, x, y, w = 160, h = 28, path = null, speed = 60) {
		super(game, id, x, y, w, h, 'platform');
		let subclass = subtype.trim() != '' ? 'p'+subtype : 'p1'
		this.classList.push(subclass)
		this.addPath(path);
		this.#speed = speed;
		this.#currentTargetIndex = 0;
		//this.#color = 'white'
	}

	addPath(path) {
		if (path != null) {
			if (this.#path == null) {
				this.#path = []
				this.#path.push({ x:this.pos.x, y:this.pos.y })
			}
			let x = this.pos.x, y = this.pos.y
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
			const dx = t2.x - this.pos.x
			const dy = t2.y - this.pos.y
			
			if ((tx > 0 && dx < 0) || (tx < 0 && dx > 0)) {
				this.#currentTargetIndex = (this.#currentTargetIndex + 1) % this.#path.length
			}

			if ((ty > 0 && dy < 0) || (ty < 0 && dy > 0)) {
				this.#currentTargetIndex = (this.#currentTargetIndex + 1) % this.#path.length
			}

			this.vel.x = Math.sign(tx) * this.#speed
			this.vel.y = Math.sign(ty) * this.#speed

			// const dist = Math.hypot(dx, dy);	// = négyzetgyök(dx*dx + dy*dy) = távolság
			// if (dx < 0)
			// if (dist < 1) {
			// 	this.#currentTargetIndex = (this.#currentTargetIndex + 1) % this.#path.length;
			// } else {
			// 	const nx = dx / dist; const ny = dy / dist;
			// 	this.vel.x = nx * this.#speed;
			// 	this.vel.y = ny * this.#speed;
			// }
			// this.vel.x = nx * this.#speed;
			// this.vel.y = ny * this.#speed;
		}
	}

	render() {
		super.render()
		this.element.style.backgroundColor = this.#color
	}
}