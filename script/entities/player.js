import Entity from './entity.js';
import { clamp } from '../utils.js'

// Player osztály
export default class Player extends Entity {
	#speed			// a játékos mozgási sebessége
	#jumpSpeed		// a játékos ugrási sebessége
	#isOnGround		// a játékos a földön áll?
	#wasOnGround	// a játékos a földön állt az előző ciklusban is
	#platform		// a plattform, amin a játékos áll

	#coins			// a begyűjtött érmék száma
	#lives			// életek (próbálkozások) száma

	get jumpSpeed() { return this.#jumpSpeed }
	get speed() { return this.#speed }
	get wasOnGround() { return this.#wasOnGround }
	get coins() { return this.#coins }

	constructor(game, id, x, y) {
		super(game, id, x, y, 48, 64, 'player')

		this.#wasOnGround = false
		this.#isOnGround = false
		this.#speed = 10
		this.#jumpSpeed = -100
		this.#reset()
	}

	#reset() {
		this.#coins = 0
		this.#lives = 4
		this.respawn()
	}

	update(dt) {
		super.update(dt);

		if (this.pos.x < 0) this.pos.x = 0

		if (this.#platform) {
			this.pos.x += this.#platform.vel.x * dt
			this.pos.y += this.#platform.vel.y * dt
		}

		this.vel.x = clamp(this.vel.x, -100, 100)
		this.vel.y = clamp(this.vel.y, -100, 100)

		this.#wasOnGround = this.#isOnGround
		this.#isOnGround = false
		this.#platform = null

		// leesés
		if (this.pos.y > this.game.worldHeight) {
			this.respawn();
		}
	}

	render() {
		super.render()
		if (this.#isOnGround) {
			this.element.classList.add('jump');
		} else {
			this.element.classList.remove('jump');
		}
		this.element.innerHTML = '<span class="eye"></span><span class="eye"></span>';
	}

	onCollision(entity, collisionInfo) {
		let type = entity.constructor.name
		switch (type) {
			case 'Platform':
				this.pos.x += collisionInfo.correction.x;
				this.pos.y += collisionInfo.correction.y;
				this.vel.x *= collisionInfo.velocityMask.x;
				this.vel.y *= collisionInfo.velocityMask.y;
				//console.log(this.id + ' vs ' + entity.id);
				if (collisionInfo.direction.bottom) {
					// ha az előbb még nem volt a talajon, azaz esésben volt
					// most pedig talajon van, akkor most landol a játékos
					if (!this.#wasOnGround) {
					 	this.game.sounds.land()
					}
					// this.#status == 'onGround'
					this.#isOnGround = true
					this.#platform = entity
				}
				break
			case 'Coin':
				const coin = entity
				if (coin.isCollectable) {
					coin.isCollectable = false
					this.game.sounds.coin();
					coin.vel.y = -400;
					coin.element.classList.add('up')
					setTimeout(() => {
						coin.element.classList.remove('up')
						coin.collect();
						this.#coins++;
						this.game.ui.updateCoins(this.#coins);
					}, 500)
				}
				break
			case 'Gate':
				if (this.game.gate.isOpen) {
					this.game.win();
				} else {
					this.game.sounds.hit();
				}
				break
		}
	}

	jump() {
		// this.#status = 'falling'
		// this.#wasOnGround = false
		this.vel.y = this.#jumpSpeed;
	}

	// 	// gomb lenyomás
	// 	for (const b of this.game.buttons) {
	// 		if (rectsOverlap(this.getBounds(), b.getBounds())) {
	// 			if (!b.down) b.press();
	// 		}
	// 	}
	// }

	respawn() {
		// reset pozíció
		this.pos.x = this.game.PlayerStartPosition.x;
		this.pos.y = this.game.PlayerStartPosition.y;
		this.vel.x = 0
		this.vel.y = 0;
		this.acc.x = 0
		this.#platform = null
		this.acc.y = this.game.gravity
		this.#lives -= 1;
		this.game.updateLives(this.#lives);
		this.game.ui.updateCoins(this.#coins);

	}
}