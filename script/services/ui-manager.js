import { clamp } from '../lib/utils.js'

// UI manager - a megjelenítés kezelése
export default class UIManager {
	#service
	#viewport
	#planes
	#hud
	#coinElement
	#livesElement

	#scale
	#viewportScale		// a látható tér mérete

	#cameraPos = { x:0, y:0 }

	get scale() { return this.#scale }
	set scale(value) {
		this.#scale = value
		this.resize()
	}
	get viewport() { return this.#viewport	 }
	get worldElement() { return this.#planes[2] }

	constructor(service, id, viewportScale) {
		this.#service = service
		this.#viewport = document.getElementById(id)
		this.#viewportScale = viewportScale
		this.#planes = []
		this.#planes.push(...document.querySelectorAll('.plane'))
		this.#hud = document.getElementById('hud')
		this.#coinElement = document.getElementById('coinCount');
		this.#livesElement = document.getElementById('lives');

		this.#cameraPos.x = 0
		this.#cameraPos.y = 0
	}

	reset() {
		this.#hud = document.getElementById('hud')
	}

	resize() {
		// get viewport size
		let width = this.#viewport.parentElement.clientWidth
		let height = this.#viewport.parentElement.clientHeight
		let aspect = width / height

		if (aspect > 1)  {
			const wi = this.#service.level.worldSize.width * this.#viewportScale
			this.#scale = width / wi
			height = wi / aspect
			width = wi
		} else {
			const he = this.#service.level.worldSize.height * this.#viewportScale
			this.#scale = height / he
			height = he
			width = he / aspect
		}
		this.#viewport.style.width = width + 'px'
		this.#viewport.style.height = height + 'px'
		this.updateCamera(this.#service.level.player,0.01)
		// let left = (document.body.clientWidth - width) / 2
		// let top = (document.body.clientHeight - height) / 2
		// this.#viewport.style.left = left + 'px'
		// this.#viewport.style.top = top + 'px'
		this.#viewport.style.transform = `scale(${this.#scale})`
	}

	updateCoins(n) {
		this.#coinElement.innerText = n;
	}

	updateLives(n) {
		this.#livesElement.innerText = '♥♥♥♥♥'.slice(0, n)
	}

	updateCamera(entity, dt) {
		const rect = entity.getBounds()
		const centerX = (rect.left + rect.right) / 2
		const centerY = (rect.top + rect.bottom) / 2
		const style = getComputedStyle(this.#viewport)
		const viewWidth = parseInt(style.width)
		const viewHeight = parseInt(style.height)
		const vpW = viewWidth / this.#scale
		const vpH = viewHeight / this.#scale
		// egyszerű clamp a világ végeire
		let targetX = clamp(centerX - vpW / 2, 0, this.#service.level.worldSize.width - vpW)
		let targetY = clamp(centerY - vpH / 2, 0, this.#service.level.worldSize.height - vpH)
		// egyszerű lerp smoothing
		this.#cameraPos.x += (targetX - this.#cameraPos.x) * Math.min(1, 8 * dt)
		this.#cameraPos.y += (targetY - this.#cameraPos.y) * Math.min(1, 8 * dt)
		// alkalmazzuk a camera transzformot a world elemre
		this.worldElement.style.transform = `translate(${-this.#cameraPos.x}px, ${-this.#cameraPos.y}px)`
	}
}