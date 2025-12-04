import Entity from './entity.js';
import { clamp } from '../utils.js'

/* ---------- Player osztály ---------- */
export default class Player extends Entity {
	#speed			// a játékos mozgási sebessége
	#jumpSpeed		// a játékos ugrási sebessége
	#isOnGround		// a játékos a földön áll?

	#coins			// a begyűjtött érmék száma
	#lives			// életek (próbálkozások) száma 

	constructor(game, id, x, y) {
		super(game, id, x, y, 48, 64, 'player')
		// belső vizuál
		this.#isOnGround = false
		this.#speed = 22		// px / sec
		this.#jumpSpeed = -660	// px / sec
		this.#reset()
	}

	#reset() {
		this.#coins = 0
		this.#lives = 3
		this.acc.x = 0
		this.acc.y = this.game.gravity
	}

	update(dt) {
		super.update(dt);

		// input vezérlés
		const input = this.game.input;
		// let ax = 0;
		if (input.left) this.acc.x -= this.#speed
		if (input.right) this.acc.x += this.#speed
		this.acc.x = clamp(this.acc.x, -2, 2);

		// ugrás: csak akkor ha a nyíl le van és a játékban most nyomódik
		if (input.up && this.isOnGround) {
			this.vel.y = this.jumpSpeed;
			this.isOnGround = false;
			this.game.sounds.jump();
			this.element.classList.add('jump');
			setTimeout(() => this.element.classList.remove('jump'), 150);
		}

		// padlóra érkezés (ha leesik)
		if (this.pos.y > this.game.worldHeight) {
			this.respawn();
		}

		// // érmék és kapu interakció
		// this.checkCollectibles();
	}

	render() {
		super.render()
		this.element.innerHTML = '<span class="eye"></span><span class="eye"></span>';
	}

	onCollision(entity) {
		let type = entity.constructor.name
		switch (type) {
			case 'Platform':
				this.vel.y = 0
				//console.log(this.id + ' vs ' + entity.id);
				break
			case 'Coin':
				entity.collect();
				this.#coins++;
				// this.game.ui.updateCoins(this.coins);
				this.game.sounds.coin();
				break
			case 'Door':
				if (this.game.door.isOpen) {
					this.game.win();
				} else {
					this.game.sounds.hit();
				}
				break
		}
	}

	// 	// gomb lenyomás
	// 	for (const b of this.game.buttons) {
	// 		if (rectsOverlap(this.getBounds(), b.getBounds())) {
	// 			if (!b.down) b.press();
	// 		}
	// 	}
	// }

	respawn() {
		this.lives -= 1;
		// TODO: UI kialakítása
		// this.game.ui.updateLives(this.lives);
		// TODO: ez a game dolga
		// if (this.lives <= 0) {
		// 	this.game.gameOver();
		// 	return;
		// }
		// reset pozíció
		this.pos.x = this.game.PlayerStartPosition.x;
		this.pos.y = this.game.PlayerStartPosition.y;
		this.vel.x = this.vel.y = 0;
	}
}