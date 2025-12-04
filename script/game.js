import { rectsOverlap, clamp } from './utils.js'

import InputHandler from './inputhandler.js'
import SoundManager from './soundmanager.js'
import UIManager from './uimanager.js'

import Entity from './entity.js'
import Platform from './platform.js'
import Coin from './entities/coin.js'
import Door from './entities/door.js'
import Button from './entities/button.js'
import Player from './player.js'

// A játékos kiinduló helye a világban
const PlayerStartPosition = {x:80, y:120 }

/* ---------- Game motor/menedzser ---------- */
export default class Game {
	#viewport			// A játék grafikus felületét megjelenítő HTML elem, két része:
	#worldElement		// - a játék világa,
	#hud				// - az információk kijelzői.
	#input			 	// A bemeneteket kezelő rész
	#sound				// A hang lejátszást kezelő rész
	#ui					// A megjelenítést kezelő rész
						// A játékban található összes 
	#entities			// - figura listája
	#platforms			// - plattform listája
	#coins				// - érme listája
	#buttons			// - nyomógomb listája
	#doors				// - ajtó listája
	#players			// A játékos figurája

	#lastTime
	#isRunning
	#cameraPos = { x:0, y:0 }

	#gravity = 1.4		// px / sec^2

	// #region olvasás (get) elérés
	get door() { return this.#doors[0]; }
	get player() { return this.#players[0]; }
	get gravity() { return this.#gravity; }
	//#endregion

	constructor() {
		this.#viewport = document.getElementById('viewport')
		this.#worldElement = document.getElementById('world')
		this.#hud = document.getElementById('hud')
		this.worldWidth = 1600
		this.worldHeight = 900 // játéktér mérete
		this.#input = new InputHandler()
		this.#sound = new SoundManager()
		this.#ui = new UIManager()

		this.#entities = []
		this.#platforms = []
		this.#coins = []
		this.#buttons = []
		this.#doors = []
		this.#players = []

		this.#lastTime = 0
		this.#isRunning = false
		this.#cameraPos.x = 0
		this.#cameraPos.y = 0

		this.#buildLevel()
		// TODO: UI kialakítása
		//this.#bindUI()
		//this.ui.setState('Ready')
	}

	addEntity(entity) {
		if (this.#entities.indexOf(entity) == -1) {
			this.#entities.push(entity)
			let type = entity.constructor.name
			switch (type) {
				case 'Coin': this.#coins.push(entity); break
				case 'Platform': this.#platforms.push(entity); break
				case 'Player': this.#players.push(entity); break
			}
			this.#worldElement.appendChild(entity.element)
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
			}
			let ix = arr.indexOf(entity)
			if (ix != -1) {
				arr.splice(ix, 1)
			}

			if (entity.element.parentNode != null) {
				this.#worldElement.removeChild(entity.element)
			}
		} else console.warn('Entity nem található!')
		return entity
	}

	// #bindUI() {
	// 	document.getElementById('btn-reset').addEventListener('click', () => this.reset())
	// }

	#cleanUpWord() {
		// Ha volt már egy világ, töröljük
		this.#worldElement.innerHTML = ''
		this.#platforms = []
		this.#coins = []
		this.#buttons = []
		this.#doors = []
		this.#players = []
	}

	#buildLevel() {
		this.#cleanUpWord()

		// egyszerű pálya: talaj és lebegő platformok
		// talaj
		const ground = new Platform(this, 'Talaj', 0, 420, 1600, 64, false)
		ground.color = 'linear-gradient(#7b4f2f,#5f3a27)'
		this.addEntity(ground);

		// egy pár lebegő platform
		this.addEntity(new Platform(this, 'P1', 120, 300))
		this.addEntity(new Platform(this, 'P2', 340, 240))
		this.addEntity(new Platform(this, 'P3', 600, 180))
		this.addEntity(new Platform(this, 'Pm4', 860, 240, 160, 28, [{ x: 860, y: 240 }, { x: 1100, y: 240 }], 60))
		this.addEntity(new Platform(this, 'P5', 1240, 300))

		// player
		this.addEntity(new Player(this, 'Player', PlayerStartPosition.x, PlayerStartPosition.y))

		// Pixel (segítő robot) lebeg a player mellett
		this.pixel = this.addEntity(new Entity(this, 'PIX', this.player.x + 56, this.player.y - 20, 40, 40, 'pixel'))

		// érmék
		this.addEntity(new Coin(this, 'C1', 140, 260))
		this.addEntity(new Coin(this, 'C2', 360, 200))
		this.addEntity(new Coin(this, 'C3', 620, 140))
		this.addEntity(new Coin(this, 'C4', 900, 200))
		this.addEntity(new Coin(this, 'C5', 1260, 260))

		// TODO: nyomógomb hozzáadása
		// // push into world elements arrays for global update
		// // gomb, ami nyit egy kaput (bemutató)
		// const btn = new Button(this, 700, 360, () => {
		// 	// lenyomva: kinyitjuk a kaput ha elég érme van, vagy a kapu ellenőrzi
		// 	if (this.door) this.door.tryOpen(this.player.coins)
		// })
		// this.buttons.push(btn)

		// door - pálya végén
		this.addEntity(new Door(this, 'D1', 1440, 320, 5)) // 5 érme kell a nyitáshoz

		// TODO: UI kialakítása
		// // játékUI alapok
		// this.ui.updateCoins(0)
		// this.ui.updateLives(this.player.lives)
	}

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

	reset() {
		this.#buildLevel();
		this.#cameraPos.x = 0
		// TODO: UI kialakítása
		//this.ui.setState('Reset')
	}

	mainLoop(timestamp) {
		// Ha fut a játék (már elindítottuk és nincsen szünet)
		if (this.#isRunning) {
		// akkor kiszámoljuk másodpercben az eltelt időt.
		// Fontos, hogy megadunk egy minimum és egy maximum értéket:
		// - legalább 5 század másodperc,
		// - legfeljebb egy tized másodperc.
			const dt = clamp((timestamp - this.#lastTime) / 1000 / 1000, 0.05, 0.1)
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

		this.checkCollisions()

		// kapu: ha elég az érme, kinyílik
		if (this.door) this.door.tryOpen(this.player.coins)

		// kamera: kövesse a játékost (csúszó kameramegoldás)
		const centerX = this.player.pos.x + this.player.width / 2
		const viewWidth = parseInt(getComputedStyle(this.#viewport).width)
		const scale = (getComputedStyle(document.documentElement).getPropertyValue('--scale') || 1)
		const vpW = viewWidth / scale
		// egyszerű clamp a világ végeire
		let targetCam = clamp(centerX - vpW / 2, 0, this.worldWidth - vpW)
		// egyszerű lerp smoothing
		this.#cameraPos.x += (targetCam - this.#cameraPos.X) * Math.min(1, 8 * dt)
		// alkalmazzuk a camera transzformot a world elemre
		this.#worldElement.style.transform = `translate(${-this.#cameraPos.x}px, 0)`
	}

	checkCollisions() {
		// // ütközés platformokkal (simple AABB)
		// this.#isOnGround = false;
		for (let e1 of this.#entities) {
			for (let e2 of this.#entities) {
				if (e1 == e2) continue
				let rect1 = e1.getBounds()
				let rect2 = e2.getBounds()
				if (rectsOverlap(rect1, rect2)) {
					// resolve collision
					e1.onCollision(e2)
				}
			}
		}
		// const bounds = this.getBounds();
		// for (const p of this.game.platforms) {
		// 	const pb = p.getBounds();
		// 	// csak akkor vizsgálunk, ha a player függőleges mozgása lefelé irányult vagy közel
		// 	if (this.vy >= -50 && rectsOverlap(bounds, pb)) {
		// 		// egyszerű felülfelületi korrekció: ha a player teteje felett helyezkedik el a platform
		// 		if (this.y + this.h - this.vy * dt <= pb.y + 6) {
		// 			this.y = pb.y - this.h; // rááll a platformra
		// 			this.vy = 0;
		// 			this.onGround = true;
		// 		} else {
		// 			// oldalról ütközés - állítsuk vissza
		// 			if (this.x < pb.x) this.x = pb.x - this.w - 0.1;
		// 			else this.x = pb.x + pb.w + 0.1;
		// 			this.vx = 0;
		// 		}
		// 	}
		// }
	}

	render() {
		for (const e of this.#entities) {
			if (e.isActive) {
				e.render()
			}
		}
	}

	gameOver() {
		this.#isRunning = false
		// TODO: UI kialakítása
		//this.ui.setState('Game Over')
		alert('Vesztettél! Újra?')
		this.reset()
	}

	win() {
		this.#isRunning = false
		// TODO: UI kialakítása
		//this.ui.setState('Kijutottál! Győzelem!')
		alert('Gratulálok! Kijutottál a pályáról!')
	}
}