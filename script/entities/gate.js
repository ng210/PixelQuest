import Entity from "./entity.js";

/* ---------- Gate (kapu) ---------- */
export default class Gate extends Entity {
	#requiredCoins
	#isOpen

	get isOpen() { return this.#isOpen }

	constructor(id, x, y, requiredCoins = 3) {
		super(id, x, y, 80, 120, 'gate');
		this.#isOpen = false;
		this.#requiredCoins = requiredCoins;
	}

	tryOpen(currentCoins) {
		return this.#isOpen || currentCoins >= this.#requiredCoins
	}

	open() {
		this.#isOpen = true;
		this.element.classList.remove('locked');
	}

	render() {
		super.render()
		this.element.innerText = this.#isOpen ? 'OPEN' : 'LOCK';
	}
}