import Entity from './entity.js';
import { clamp } from '../lib/utils.js'

// Player osztály
export default class Player extends Entity {
	#speed			// a játékos mozgási sebessége
	#jumpSpeed		// a játékos ugrási sebessége
	#isGrounded		// a játékos a földön áll?
	#wasGrounded	// a játékos a földön állt az előző ciklusban is?

	#platform		// a plattform, amin a játékos áll

	#coins			// a begyűjtött érmék száma
	#lives			// életek (próbálkozások) száma

	#services

	#wasHittingGate
	#isHittingGate

	get jumpSpeed() { return this.#jumpSpeed }
	get speed() { return this.#speed }
	get isGrounded() { return this.#isGrounded }
	get coins() { return this.#coins }

	constructor(id, x, y, services) {
		super(id, x, y, 48, 64)
		this.#services = services
		this.flexibility	 = 0.0

		this.#isGrounded = false
		this.#wasGrounded = false
		this.isMoving = false
		// this.#wasHittingGate = false
		// this.#isHittingGate = false
		this.#speed = 200
		this.#jumpSpeed = -350

		this.#reset()
	}

	#reset() {
		this.#coins = 0
		this.#lives = 4
		//this.respawn()
	}

	update(dt) {
		super.update(dt);
		if (!this.#isGrounded) {
			// levegőben van
			this.#platform = null
		} else {
			if (!this.#wasGrounded) {
				// éppen most ért földet
				this.#services.sounds.land();
				if (Math.sign(this.acceleration.x) != Math.sign(this.velocity.x)) {
					this.acceleration.x = 0
				}				
			}
			if (this.#platform) {
				this.position.x += this.#platform.velocity.x * dt
			}
			if (this.acceleration.x == 0) {
				this.velocity.x *= 0.01;
			}
		}

		this.#wasGrounded = this.#isGrounded;
		this.#isGrounded = false;
	}

	onCollision(entity, collisionInfo) {
		let result = true
		let type = entity.constructor.name
		switch (type) {
			case 'Platform':
				this.#platform = entity
				if (collisionInfo.normal.y == -1) {
					this.#isGrounded = true
				}
				break
			case 'Coin':
				const coin = entity
				if (coin.isCollectable) {
					coin.isCollectable = false
					this.#services.sounds.coin();
					coin.velocity.y = -400;
					//coin.element.classList.add('up')
					setTimeout(() => {
						coin.collect();
						this.#coins++;
						this.#services.ui.updateCoins(this.#coins);
						//coin.element.classList.remove('up')
					}, 500)
				}
				result = false
				break
			case 'Life':
				const life = entity
				if (life.isCollectable) {
					life.isCollectable = false
					this.#services.sounds.life();
					life.velocity.y = -400;
					//life.element.classList.add('up')
					setTimeout(() => {
						life.collect();
						this.#lives++;
						this.#services.ui.updateLives(this.#lives);
						//life.element.classList.remove('up')
					}, 500)
				}
				result = false
				break
		// 	case 'Gate':
		// 		if (entity.isOpen) {
		// 			this.game.gameOver(true)
		// 		}
		// 		if (!this.#wasHittingGate) {
		// 			this.game.sounds.hit()
		// 		}
		// 		this.#isHittingGate = true
		// 		break
			case 'Block':
				if (collisionInfo.normal.y == -1) {
					this.#isGrounded = true
				}
				break
			case 'Pixel':
				debugger
				break	
		}

		return result
	}

	jump() {
		this.velocity.y = this.#jumpSpeed;
	}
}