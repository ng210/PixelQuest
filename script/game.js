import { clamp } from './utils.js'
import resolveAABBCollision from './collision.js'

import InputHandler from './inputhandler.js'
import SoundManager from './soundmanager.js'
import UIManager from './uimanager.js'

import Entity from './entities/entity.js'
import Platform from './entities/platform.js'
import Coin from './entities/coin.js'
import Life from './entities/life.js'
import Gate from './entities/gate.js'
import Player from './entities/player.js'

// Game motor/menedzser
export default class Game {
	PlayerStartPosition = {x:0, y:0 }	// A játékos kiinduló helye a világban

	#viewport			// A játék grafikus felületét megjelenítő HTML elem.
	#planes = []		// A játék 4 síkja: 2 háttér, world, előtér
	#scale
	#hud				// - az információk kijelzői.
	#input			 	// A bemeneteket kezelő rész
	#sounds				// A hang lejátszást kezelő rész
	#ui					// A megjelenítést kezelő rész
						// A játékban található összes 
	#entities			// - figurák listája
	#platforms			// - plattformok listája
	#coins				// - érmék listája
	#buttons			// - nyomógombok listája
	#gates				// - kapuk listája
	#players			// - játékosok figurája

	#lastTime
	#isRunning
	#cameraPos = { x:0, y:0 }
	#currentLevel

	// Előre megadott állandó értékek, konstansok
	static #gravity = 100		// px / sec^2
	static #viewportWidth = 960
	static #viewportHeight = 320


	// #region olvasás (get) elérés
	get worldElement() { return this.#planes[2] }
	get gate() { return this.#gates[0]; }
	get player() { return this.#players[0]; }
	get gravity() { return Game.#gravity; }

	get input() { return this.#input }
	get sounds() { return this.#sounds }
	get ui() { return this.#ui }

	//#endregion

	constructor() {
		this.#viewport = document.getElementById('viewport')
		this.#planes.push(...document.querySelectorAll('.plane'))
		this.#hud = document.getElementById('hud')
		this.#scale = 1
		this.worldWidth = 1800
		this.worldHeight = 900 // játéktér mérete
		this.#input = new InputHandler()
		this.#sounds = new SoundManager()
		this.#ui = new UIManager()

		this.#entities = []
		this.#platforms = []
		this.#coins = []
		this.#buttons = []
		this.#gates = []
		this.#players = []

		this.#lastTime = 0
		this.#isRunning = false
		this.#cameraPos.x = 0
		this.#cameraPos.y = 0

		window.addEventListener('resize', () => this.resize())

		this.resize()
	}

	addEntity(entity) {
		if (this.#entities.indexOf(entity) == -1) {
			this.#entities.push(entity)
			let type = entity.constructor.name
			switch (type) {
				case 'Coin': this.#coins.push(entity); break
				case 'Platform': this.#platforms.push(entity); break
				case 'Player': this.#players.push(entity); break
				case 'Button': this.#buttons.push(entity); break
				case 'Gate': this.#gates	.push(entity); break
			}
			this.worldElement.appendChild(entity.element)
		} else {
			console.warn('Entity már létezik!')
		}
		return entity
	}

	removeEntity(entity) {
		let ix = this.#entities.indexOf(entity)
		if (ix != -1) {
			this.#entities.splice(ix, 1)
			let arr
			let type = entity.constructor.name
			switch (type) {
				case 'Coin': arr = this.#coins; break
				case 'Platform': arr = this.#platforms; break
				case 'Player': arr = this.#players; break
				default: arr = this.#entities; break
			}
			ix = arr.indexOf(entity)
			if (ix != -1) {
				arr.splice(ix, 1)
			}

			if (entity.element.parentNode != null) {
				this.worldElement.removeChild(entity.element)
			}
		} else console.warn('Entity nem található!')
		return entity
	}

	//#region Világ kezelése
	#cleanUpWord() {
		// Ha volt már egy világ, töröljük
		this.worldElement.innerHTML = ''
		this.#platforms = []
		this.#coins = []
		this.#buttons = []
		this.#gates = []
		this.#players = []
	}

	async loadLevel(path) {
		let levelData = await fetch('assets/' + path).then(resp => {
			if (resp.ok) {
				return path.endsWith('json') ? resp.json() : resp.text()
			} else {
				console.error(resp.status)
				return null
			}
		})

		if (levelData != null) {
			if (typeof levelData === 'string') {
				levelData = this.#convertLevel(levelData)
			}
			this.#buildLevel(levelData)
		}
	}

	#convertLevel(text) {
		let lines = text.split('\n')
		let data = {}
		let counters = {
			'Platform': 0,
			'Coin': 0,
			'Life': 0,
			'Default': 0
		}
		const blockWidth = this.worldWidth / (lines[0].length / 2)
		const blockHeight = this.worldHeight / lines.length
		let movingBlocks = []
		let lastBlock = { x: -1, y: 0, width: 0, height: 0, move: false, subtype:'1' }
		let y = 0
		let li = 0
		for (; li<lines.length-2; li++) {
			let line = lines[li+2]
			if (line == '') break
			let x = 0
			for (let i=0; i<line.length - 1; i+=2) {
				let ch = line[i+2]
				switch (ch) {
					case ' ':
						if (lastBlock.x != -1) {
							let block = {
								"type": "Platform",
								"x":lastBlock.x, "y":lastBlock.y,
								"subtype": lastBlock.subtype,
								"width":lastBlock.width, "height":lastBlock.height
							}
							if (lastBlock.move) {
								movingBlocks.push(block)
							}
							
							data['P'+counters.Platform] = block
							counters.Platform++
							lastBlock.x = -1
							lastBlock.subtype = '1'
							lastBlock.move = false
						}
						break
					case 'c':
						data['C'+counters.Coin] = {
							"type": "Coin",
							"x":x, "y":y
						}
						counters.Coin++
						break
					case 'S':
						data['S'+counters.Default] = {
							"type": "Player",
							"x":x, "y":y
						}
						counters.Default++
						break
					case 'G':
						data['G'+counters.Default] = {
							"type": "Gate",
							"x":x, "y":y,
							"fee": 10
						}
						counters.Default++
						break
					case 'L':
						data['L'+counters.Life] = {
							"type": "Life",
							"x":x, "y":y
						}
						counters.Life++
						break
					case 'B':
						if (lastBlock.x == -1) {
							lastBlock.x = x
							lastBlock.y = y
							lastBlock.width = blockWidth
							lastBlock.subtype = '1'
							lastBlock.move = false
							if (line[i+3] == 'm') {
								lastBlock.move = true
								lastBlock.subtype = 'm'
							} else {
								lastBlock.subtype = line[i+3]
							}
							lastBlock.height = blockHeight
						} else {
							lastBlock.width += blockWidth
						}
						break
				}
				x += blockWidth
			}
			if (lastBlock.x != -1) {
				let block = {
					"type": "Platform",
					"x":lastBlock.x, "y":lastBlock.y,
					"subtype": lastBlock.subtype,
					"width":lastBlock.width, "height":lastBlock.height
				}
				if (lastBlock.move) {
					movingBlocks.push(block)
					lastBlock.move = false
				}
				data['P'+counters.Platform] = block
				counters.Platform++
				lastBlock.x = -1
			}
			y += blockHeight
		}

		li += 3
		let bi = 0
		for (;li<lines.length; li++) {
			let tokens = lines[li].split(' ')
			let bl = movingBlocks[bi++]
			bl.speed = Number(tokens[0])
			let path = []
			for (let ti=1; ti<tokens.length; ti+=2) {
				path.push({
					dx: Number(tokens[ti]) * blockWidth,
					dy: Number(tokens[ti+1]) * blockHeight})
			}
			bl.path = path
		}

		return data
	}

	#buildLevel(lvlData) {
		this.#currentLevel = lvlData
		this.#cleanUpWord()

		for (let name in lvlData) {
			let item = lvlData[name]
			let entity = null
			// Objektum gyár
			switch (item.type) {
				case 'Player':
					this.PlayerStartPosition.x = item.x
					this.PlayerStartPosition.y = item.y
					entity = new Player(this, name, item.x, item.y);
					this.pixel = this.addEntity(new Entity(this, 'PIX', item.x + 56, item.y - 20, 40, 40, 'pixel'))
					break
				case 'Platform': entity = new Platform(this, name, item.subtype, item.x, item.y, item.width, item.height, item.path, item.speed); break
				case 'Coin': entity = new Coin(this, name, item.x, item.y); break
				case 'Life': entity = new Life(this, name, item.x, item.y); break
				case 'Gate': entity = new Gate(this, name, item.x, item.y, item.fee); break
			}
			this.addEntity(entity)
		}
	}
	//#endregion

	start() {
		// Indítással a játék futni fog, tehát
		// a "fut?" kérdésre "igaz" lesz most már a válasz
		this.#isRunning = true
		// TODO: UI kialakítása
		//this.ui.setState('Running')
		// Kiolvassuk a kezdeti időbélyeget
		this.#lastTime = performance.now()
		// A 'requestAnimationFrame' metódus segítségével a játék vázát adó
		// 'mainLoop' elnevezésű kódblokk újra és újra végrehajtásra kerül.
		// Másodpercenként 50-szer 60-szor.
		requestAnimationFrame(timestamp => this.mainLoop(timestamp))
	}

	gameOver() {
		this.#isRunning = false
		alert('Vesztettél! Újra?')
		this.reset()
	}

	win() {
		this.#isRunning = false
		alert('Gratulálok! Kijutottál a pályáról!')
	}

	resize() {
		// A viewport legjobb mérete: 640x320.
		// Az ablak mérete alapján meghatározzuk, hogy fekvő vagy álló elrendezésben jelenítjük meg.
		let width = document.body.clientWidth
		let height = document.body.clientHeight
		let aspect = width / height
		if (aspect > 1)  {
			this.#scale = width / Game.#viewportWidth
			width = Game.#viewportWidth
			height = width / aspect
		} else {
			this.#scale = height / Game.#viewportHeight
			height = Game.#viewportHeight
			width = height / aspect
		}
		this.#viewport.style.width = width + 'px'
		this.#viewport.style.height = height + 'px'
		let left = (document.body.clientWidth - width) / 2
		let top = (document.body.clientHeight - height) / 2
		this.#viewport.style.left = left + 'px'
		this.#viewport.style.top = top + 'px'
		this.#viewport.style.transform = `scale(${this.#scale})`
	}

	reset() {
		this.#buildLevel(this.#currentLevel);
		this.#cameraPos.x = 0
		this.updateLives(this.player.lives)
		this.ui.updateCoins(0)
		this.#isRunning = true
	}

	updateCamera(dt) {
		// kamera: kövesse a játékost (csúszó kameramegoldás)
		const centerX = this.player.pos.x + this.player.width / 2
		const centerY = this.player.pos.y + this.player.height / 2
		const style = getComputedStyle(this.#viewport)
		const viewWidth = parseInt(style.width)
		const viewHeight = parseInt(style.height)
		const scale = 1	//(getComputedStyle(document.documentElement).getPropertyValue('--scale') || 1)
		const vpW = viewWidth / scale
		const vpH = viewHeight / scale
		// egyszerű clamp a világ végeire
		let targetX = clamp(centerX - vpW / 2, 0, this.worldWidth - vpW)
		let targetY = clamp(centerY - vpH / 2, 0, this.worldHeight - vpH)
		// egyszerű lerp smoothing
		this.#cameraPos.x += (targetX - this.#cameraPos.x) * Math.min(1, 8 * dt)
		this.#cameraPos.y += (targetY - this.#cameraPos.y) * Math.min(1, 8 * dt)
		// alkalmazzuk a camera transzformot a world elemre
		this.worldElement.style.transform = `translate(${-this.#cameraPos.x}px, ${-this.#cameraPos.y}px)`
	}

	updateLives(lives) {
		this.ui.updateLives(lives)
		if (lives <= 0) {
			this.gameOver();
		}
	}

	checkCollisions(dt) {
		// Megvizsgáljuk, hogy melyik figura melyikkel ütközik
		for (let e1 of this.#entities) {
			if (e1.isMoving()) {
				for (let e2 of this.#entities) {
					if (e1 == e2) continue
					let rect1 = e1.getBounds()
					let rect2 = e2.getBounds()
					let collisionInfo = resolveAABBCollision(rect1, rect2);
					if (collisionInfo.collides) {
						e1.onCollision(e2, collisionInfo)
					}
				}
			}
		}
	}


	//#region A játék gerincét alkotó fő kódblokkok
	handleInputs() {
		const inp = this.#input
		const pl = this.player
		// Ha a játékos a talajon áll, csak akkor vizsgáljuk meg a lenyomott
		// billentyűket és ha kell mozgatjuk a játékost.
		if (pl.wasOnGround) {
			if (inp.left) {
				if (pl.acc.x > 0) {
					pl.vel.x = 0
				}
				pl.acc.x = -pl.speed
			} else if (inp.right) {
				if (pl.acc.x < 0) {
					pl.vel.x = 0
				}
				pl.acc.x = pl.speed
			} else {
				pl.acc.x = 0
				pl.vel.x *= 0.4;
				if (Math.abs(pl.vel.x) < 0.1) pl.vel.x = 0;
			}

			// ugrás: a játékos talajon áll
			if (inp.up || inp.button1) {
				pl.jump();
				this.sounds.jump();
			}
		}
	}

	// Minden játékban van egy rész, ami lehetőleg minél gyakrabban aktualizálja a
	// játék elemeinek, például a kamera, háttér, NPC-k és a játékos figuráinak állapotát.
	update(dt) {
		// pixel (segítő) követi a playert (egyszerű)
		this.pixel.pos.x = this.player.pos.x + 56
		this.pixel.pos.y = this.player.pos.y - 20

		// frissítjük a figurákat
		for (const e of this.#entities) {
			if (e.isActive) {
				e.update(dt)
			}
		}

		this.checkCollisions(dt)

		// kapu: ha elég az érme, kinyílik
		if (!this.gate.isOpen && this.gate.tryOpen(this.player.coins)) {
			this.sounds.openGate()
			this.gate.open()
		}

		this.updateCamera(dt)
	}

	render() {
		for (const e of this.#entities) {
			if (e.isActive) {
				e.render()
			}
		}
	}

	mainLoop(timestamp) {
		// Ha fut a játék (már elindítottuk és nincsen szünet)
		if (this.#isRunning) {
		// akkor kiszámoljuk másodpercben az eltelt időt.
		// Fontos, hogy megadunk egy minimum és egy maximum értéket:
		// - legalább 5 század másodperc,
		// - legfeljebb egy tized másodperc.
			const dt = clamp((timestamp - this.#lastTime) / 1000 / 1000, 0.05, 0.1)
			this.handleInputs();

			// aktualizáljuk a játék minden elemét, figuráját
			this.update(dt)
			// jelenítsük meg a játék minden elemét, figuráját
			this.render()
		}

		// A mostani időbélyeg lesz az új "utolsó" időbélyeg.
		this.#lastTime = timestamp
		// A böngésző majd legközelebb is  hajtsa végre a mainLoop kódblokkot.
		requestAnimationFrame(ts => this.mainLoop(ts))
	}
	//#endregion
}