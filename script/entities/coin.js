import Collectible from "./collectible.js";

/* ---------- Coin osztály ---------- */
export default class Coin extends Collectible {
	#phase
	#originalWidth
	isCollectable

	constructor(game, id, x, y) {
		const width = 20
		super(game, id, x, y, width, 20, ['coin']);
		this.#originalWidth = width
		this.#phase = Math.random();
		this.isCollectable = true
	}
	update(dt) {
		super.update(dt);
		this.#phase += 0.2
		this.scale.x = (1.0 + Math.sin(this.#phase)) / 2
	}
}