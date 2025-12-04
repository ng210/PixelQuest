/* ---------- UI manager (kijelző) ---------- */
export default class UIManager {
	constructor() {
		this.coinEl = document.getElementById('coinCount');
		this.livesEl = document.getElementById('lives');
		this.stateEl = document.getElementById('state');
	}
	updateCoins(n) { this.coinEl.innerText = n; }
	updateLives(n) { this.livesEl.innerText = n; }
	setState(s) { this.stateEl.innerText = s; }
}