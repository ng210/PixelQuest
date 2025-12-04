import Entity from './entity.js';

/* ---------- Platform osztály ---------- */
export default class Platform extends Entity {
	constructor(game, x, y, w = 160, h = 28, movable = false, path = null, speed = 60) {
		super(game, x, y, w, h, 'platform');
		this.movable = movable;
		this.path = path; // path: [{x,y}, ...]
		this.speed = speed;
		this.currentTargetIndex = 0;
	}
	update(dt) {
		if (this.movable && this.path && this.path.length > 0) {
			const t = this.path[this.currentTargetIndex];
			const dx = t.x - this.x;
			const dy = t.y - this.y;
			const dist = Math.hypot(dx, dy);
			if (dist < 1) {
				this.currentTargetIndex = (this.currentTargetIndex + 1) % this.path.length;
			} else {
				const nx = dx / dist; const ny = dy / dist;
				this.x += nx * this.speed * dt;
				this.y += ny * this.speed * dt;
			}
		}
		super.update(dt);
		this.updateDom();
	}
}