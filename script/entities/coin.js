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
		this.#phase += 0.2
		this.scale.x = (1.0 + Math.sin(this.#phase)) / 2
	}
	collect() {
		this.destroy();
	}
}