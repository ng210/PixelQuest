import Entity from "../entity.js";

/* ---------- Door (kapu) ---------- */
export default class Door extends Entity {
	constructor(game, x, y, requiredCoins = 3) {
		super(game, x, y, 80, 120, 'door locked');
		this.isOpen = false;
		this.requiredCoins = requiredCoins;
		this.el.innerText = 'LOCK';
	}
	tryOpen(currentCoins) {
		if (this.isOpen) return;
		if (currentCoins >= this.requiredCoins) {
			this.open();
		}
	}
	open() {
		this.isOpen = true;
		this.el.classList.remove('locked');
		this.el.innerText = 'OPEN';
		// látványos effektet adhatunk
	}
}