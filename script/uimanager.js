/* ---------- UI manager (kijelző) ---------- */
export default class UIManager {
	#coinElement
	#livesElement

	constructor() {
		this.#coinElement = document.getElementById('coinCount');
		this.#livesElement = document.getElementById('lives');
	}
	updateCoins(n) { this.#coinElement.innerText = n; }
	updateLives(n) {
		this.#livesElement.innerText = '♥♥♥♥♥♥♥♥♥♥'.slice(0, n);
	}
}