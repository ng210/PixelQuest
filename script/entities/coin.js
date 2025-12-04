import Entity from "../entity.js";

/* ---------- Coin osztály ---------- */
export default class Coin extends Entity {
	constructor(game, x, y) {
		super(game, x, y, 20, 20, 'coin');
		this.collected = false;
		// egyszerű "forgás" animáció: periodic bob
		this.startY = y;
		this.time = Math.random() * 10;
	}
	update(dt) {
		this.time += dt;
		this.y = this.startY + Math.sin(this.time * 6) * 6;
		super.update(dt);
		this.updateDom();
	}
	collect() {
		this.collected = true;
		this.destroy();
		const idx = this.game.coins.indexOf(this);
		if (idx >= 0) this.game.coins.splice(idx, 1);
	}
}