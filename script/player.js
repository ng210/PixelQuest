import Entity from './entity.js';
import { rectsOverlap } from './utils.js';

/* ---------- Player osztály ---------- */
export default class Player extends Entity {
	constructor(game, x, y) {
		super(game, x, y, 48, 64, 'player');
		// belső vizuál
		this.el.innerHTML = '<span class="eye"></span><span class="eye"></span>';
		this.onGround = false;
		this.speed = 220;      // px / sec
		this.jumpSpeed = -660; // px / sec
		this.gravity = 1400;   // px / sec^2
		this.coins = 0;
		this.lives = 3;
	}
	update(dt) {
		// input vezérlés
		const input = this.game.input;
		let ax = 0;
		if (input.left) ax = -1;
		if (input.right) ax = 1;
		this.vx = ax * this.speed;

		// ugrás: csak akkor ha a nyíl le van és a játékban most nyomódik
		if (input.up && this.onGround) {
			this.vy = this.jumpSpeed;
			this.onGround = false;
			this.game.sounds.jump();
			this.el.classList.add('jump');
			setTimeout(() => this.el.classList.remove('jump'), 150);
		}

		// gravitáció
		this.vy += this.gravity * dt;

		// frissítjük pozíciót
		super.update(dt);

		// ütközés platformokkal (simple AABB)
		this.onGround = false;
		const bounds = this.getBounds();
		for (const p of this.game.platforms) {
			const pb = p.getBounds();
			// csak akkor vizsgálunk, ha a player függőleges mozgása lefelé irányult vagy közel
			if (this.vy >= -50 && rectsOverlap(bounds, pb)) {
				// egyszerű felülfelületi korrekció: ha a player teteje felett helyezkedik el a platform
				if (this.y + this.h - this.vy * dt <= pb.y + 6) {
					this.y = pb.y - this.h; // rááll a platformra
					this.vy = 0;
					this.onGround = true;
				} else {
					// oldalról ütközés - állítsuk vissza
					if (this.x < pb.x) this.x = pb.x - this.w - 0.1;
					else this.x = pb.x + pb.w + 0.1;
					this.vx = 0;
				}
			}
		}

		// padlóra érkezés (ha leesik)
		if (this.y > this.game.worldHeight) {
			this.respawn();
		}

		// érmék és kapu interakció
		this.checkCollectibles();

		// frissít DOM
		this.updateDom();
	}

	checkCollectibles() {
		// coin gyűjtés
		for (let i = this.game.coins.length - 1; i >= 0; i--) {
			const c = this.game.coins[i];
			if (rectsOverlap(this.getBounds(), c.getBounds())) {
				// collect
				c.collect();
				this.coins += 1;
				this.game.ui.updateCoins(this.coins);
				this.game.sounds.coin();
			}
		}
		// gomb lenyomás
		for (const b of this.game.buttons) {
			if (rectsOverlap(this.getBounds(), b.getBounds())) {
				if (!b.down) b.press();
			}
		}
		// kapu (door)
		if (this.game.door) {
			if (rectsOverlap(this.getBounds(), this.game.door.getBounds())) {
				if (this.game.door.isOpen) {
					this.game.win();
				} else {
					// ha zárt, koppanás
					this.game.sounds.hit();
				}
			}
		}
	}

	respawn() {
		this.lives -= 1;
		this.game.ui.updateLives(this.lives);
		if (this.lives <= 0) {
			this.game.gameOver();
			return;
		}
		// reset pozíció
		this.x = this.game.playerStart.x;
		this.y = this.game.playerStart.y;
		this.vx = this.vy = 0;
	}
}