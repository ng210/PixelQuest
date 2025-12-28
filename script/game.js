import { clamp } from './lib/utils.js'
import InputManager from './services/input-manager.js'
import SoundManager from './services/sound-manager.js'
import UIManager from './services/ui-manager.js'
import LevelManager from './services/level-manager.js'
import CollisionResolver from './services/collision-resolver.js'
import DomRendererFactory from './renderer/dom-renderer-factory.js'

const FIXED_DT = 1 / 60             // 60 Hz
const MAX_ACCUMULATED_TIME = 0.5    // seconds

export default class Game {
    #services = {
        hud: null,
        input: null,
        sounds: null,
        ui: null,
        level: null
    }

    #lastTime
    #accumulatedTime
    #requestId
    #isRunning

    #rendererFactory

    get hud() { return this.#services.hud }
    get input() { return this.#services.input }
    get sounds() { return this.#services.sounds }
    get ui() { return this.#services.ui }
    get level() { return this.#services.level }

    constructor(id, viewportScale, blockWidth, blockHeight, rendererType = 'DOM') {
        this.#services.input = new InputManager()
        this.#services.sounds = new SoundManager()
        const blockSize = { width: blockWidth, height: blockHeight }
        this.#services.level = new LevelManager(this.#services, blockSize)
        this.#services.ui = new UIManager(this.#services, id, viewportScale)
        this.#services.collisionResolver = new CollisionResolver()

        this.#lastTime = 0
        this.#accumulatedTime = 0
        this.#requestId = null
        this.#isRunning = false
		this.setRendererType(rendererType)

        window.addEventListener('resize', () => this.resize())
    }

    setRendererType(type) {
		switch (type) {
			case 'DOM':
			default:
				this.#rendererFactory = new DomRendererFactory(document.getElementById('world'))
				break
		}
    }

    start() {
        if (!this.#isRunning) {
            this.#isRunning = true
            this.#lastTime = performance.now() / 1000
            this.#accumulatedTime = 0
            this.#requestId = requestAnimationFrame(this.#main.bind(this))
        }
    }

    stop() {
        if (this.#isRunning) {
            this.#isRunning = false
            if (this.#requestId) cancelAnimationFrame(this.#requestId)
        }
    }

    async loadLevel(path) {
        await this.#services.level.loadLevel(path)
        this.resize()
    }

	#handleInputs() {
		const inp = this.#services.input
		const pl = this.#services.level.player
		// Ha a játékos a talajon áll, csak akkor vizsgáljuk meg a lenyomott
		// billentyűket és ha kell mozgatjuk a játékost.
		if (pl.isGrounded) {
			if (inp.left) {
				if (pl.acceleration.x > 0) {
					pl.velocity.x = 0
				}
				pl.acceleration.x = -pl.speed
			} else if (inp.right) {
				if (pl.acceleration.x < 0) {
					pl.velocity.x = 0
				}
				pl.acceleration.x = pl.speed
			} else {
				pl.acceleration.x = 0
				if (Math.abs(pl.velocity.x) < 0.1) pl.velocity.x = 0;
			}

			// ugrás: a játékos talajon áll
			if (inp.up || inp.button1) {
				pl.jump();
				this.sounds.jump();
			}
		} else {
            pl.acceleration.x = 0
        }
	}

    #update(dt) {
        // 1. Integrate dynamic entities
        for (const entity of this.#services.level.entities) {
            if (!entity.isActive || !entity.isUpdated) continue
            entity.update(dt)
        }

        // 2. Collision detection & resolution
        this.#services.level.handleCollisions(dt)

        // // 3. Game-specific logic (optional)
        // this.#level.updateLogic(dt)

        this.#services.ui.updateCamera(this.#services.level.player, dt)
    }

    #render(alpha = 1) {
        for (const entity of this.#services.level.entities) {
            if (!entity.isActive) continue
            if (!entity.renderer) this.#rendererFactory.createRenderer(entity)
            entity.renderer.render(alpha)
        }
    }

    #main(currentTimeMs) {
        const currentTime = currentTimeMs / 1000
        let frameTime = currentTime - this.#lastTime
        this.#lastTime = currentTime

        this.#handleInputs()

        // Clamp accumulated time
        frameTime = clamp(frameTime, 0, MAX_ACCUMULATED_TIME)
        this.#accumulatedTime += frameTime

        while (this.#accumulatedTime >= FIXED_DT) {
            this.#update(FIXED_DT)
            this.#accumulatedTime -= FIXED_DT
        }

        const alpha = this.#accumulatedTime / FIXED_DT
        this.#render(alpha)

        if (this.#isRunning) {
            this.#requestId = requestAnimationFrame(this.#main.bind(this))
        }
    }

    resize() {
        if (this.#services.ui) this.#services.ui.resize()
    }
}
