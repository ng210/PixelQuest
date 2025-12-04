import Entity from "../entity.js";

/* ---------- Door (kapu) ---------- */
export default class Door extends Entity {
	#requiredCoins
	#isOpen
	constructor(game, id, x, y, requiredCoins = 3) {
		super(game, id, x, y, 80, 120, 'door locked');
		this.#isOpen = false;
		this.#requiredCoins = requiredCoins;
	}

	tryOpen(currentCoins) {
		if (this.#isOpen) return;
		if (currentCoins >= this.#requiredCoins) {
			this.open();
		}
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