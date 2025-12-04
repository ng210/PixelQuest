import Entity from './entity.js';
import { rectsOverlap } from './utils.js';

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
		this.#speed = 220		// px / sec
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
		// // input vezérlés
		// const input = this.game.input;
		// let ax = 0;
		// if (input.left) ax = -1;
		// if (input.right) ax = 1;
		// this.vx = ax * this.speed;

		// // ugrás: csak akkor ha a nyíl le van és a játékban most nyomódik
		// if (input.up && this.onGround) {
		// 	this.vy = this.jumpSpeed;
		// 	this.onGround = false;
		// 	this.game.sounds.jump();
		// 	this.el.classList.add('jump');
		// 	setTimeout(() => this.el.classList.remove('jump'), 150);
		// }

		// frissítjük pozíciót
		super.update(dt);

		// // padlóra érkezés (ha leesik)
		// if (this.pos.y > this.game.worldHeight) {
		// 	this.respawn();
		// }

		// // érmék és kapu interakció
		// this.checkCollectibles();
	}

	render() {
		super.render()
		this.element.innerHTML = '<span class="eye"></span><span class="eye"></span>';
	}

	// checkCollectibles() {
	// 	// coin gyűjtés
	// 	for (let i = this.game.coins.length - 1; i >= 0; i--) {
	// 		const c = this.game.coins[i];
	// 		if (rectsOverlap(this.getBounds(), c.getBounds())) {
	// 			// collect
	// 			c.collect();
	// 			this.coins += 1;
	// 			this.game.ui.updateCoins(this.coins);
	// 			this.game.sounds.coin();
	// 		}
	// 	}
	// 	// gomb lenyomás
	// 	for (const b of this.game.buttons) {
	// 		if (rectsOverlap(this.getBounds(), b.getBounds())) {
	// 			if (!b.down) b.press();
	// 		}
	// 	}
	// 	// kapu (door)
	// 	if (this.game.door) {
	// 		if (rectsOverlap(this.getBounds(), this.game.door.getBounds())) {
	// 			if (this.game.door.isOpen) {
	// 				this.game.win();
	// 			} else {
	// 				// ha zárt, koppanás
	// 				this.game.sounds.hit();
	// 			}
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
		this.pos.x = PlayerStartPosition.x;
		this.pos.y = PlayerStartPosition.y;
		this.vel.x = this.vel.y = 0;
	}
}