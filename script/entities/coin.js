import Entity from "../entity.js";

/* ---------- Coin osztály ---------- */
export default class Coin extends Entity {
	#phase
	#originalWidth
	constructor(game, id, x, y) {
		const width = 20
		super(game, id, x, y, width, 20, 'coin');
		this.#originalWidth = width
		this.#phase = Math.random();
	}
	update(dt) {
		super.update(dt);
		this.#phase += 0.1
		this.width = this.#originalWidth * Math.sin(this.#phase)
	}
	collect() {
		this.destroy();
	}
}