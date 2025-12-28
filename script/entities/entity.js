import Rect from '../lib/rect.js'

// // Entity: alap osztály minden játékbeli figurához
// export default class Entity {
// 	#id							// a figura azonosítója
// 	#game						// a játék példánya
// 	#pos = { x:0, y:0 }			// a figura helye (x, y koordináta)
// 	#width						// a figura szélessége pixelben
// 	#height						// a figura magassága pixelben
// 	#scale = { x:1, y:1 }		// a figura méretezése (nagyítás-kicsinyítés)
// 	#rotate = { x:0, y:0, z:0 }	// a figura méretezése (nagyítás-kicsinyítés)
// 	#classList					// a figura CSS osztálya (megjelenítés)
// 	#vel = { x:0, y:0 }			// a figura sebessége (vizszintes és függőleges irányban)
// 	#acc = { x:0, y:0 }		// a figura gyorsulása (vizszintes és függőleges irányban)
// 	#element = null				// a figurát megjelenítő HTML (weboldali) elem
// 	#time						// a figura saját ideje, amit animációhoz használ
// 	#isActive					// aktív a figura vagy figyelmen kívül lehet hagyni?
	
// 	// #region olvasás (get) elérés
// 	get id() { return this.#id }
// 	get game() { return this.#game }
// 	get pos() { return this.#pos }
// 	get width() { return this.#width }
// 	set width(wi) { this.#width = wi }
// 	get height() { return this.#height }
// 	set height(he) { this.#height = he }
// 	get scale() { return this.#scale }
// 	get rotate() { return this.#rotate }
// 	get classList() { return this.#classList }
// 	get vel() { return this.#vel }
// 	get acc() { return this.#acc }
// 	get element() { return this.#element }
// 	get time() { return this.#time }
// 	get isActive() { return this.#isActive }
// 	set isActive(value) { this.#isActive = !!value }


// 	//#endregion

// 	// A figuránkat le kell gyártani, meg kell konstruálni, azaz ki kell tölteni adatokkal.
// 	// Az alábbi kódblokk (metódus) ezt végzi el.
// 	constructor(game, id, x, y, w, h, className = '') {
// 		this.#id = id
// 		this.#game = game
// 		this.#pos.x = x; this.#pos.y = y
// 		this.#width = w; this.#height = h
// 		this.#vel.x = 0; this.#vel.y = 0
// 		this.#acc.x = 0; this.#acc.y = 0
// 		this.#classList = []
// 		if (className != '') this.#classList.push('entity', className)
// 		this.#time = 0
// 		this.#isActive = true

// 		// A HTML alapú megjelenítés nagyon egyszerű:
// 		//	- hozzuk létre a HTML elemet (div)
// 		this.#element = document.createElement('div')
// 		//	- állítsuk be néhány tulajdonságát
// 		//	  például az azonosítóját, vagy
// 		this.#element.id = this.#id
// 		//	  a megjelenítés sablonját (CSS osztály)
// 		for (let cn of this.#classList) {
// 			this.#element.classList.add(cn)
// 		}
// 	}

// 	// A figura időben változhat, mozoghat. Az alábbi kódblokk kiszámolja a figura helyét
// 	// és sebességét, ezután módosítja a megjelenését.
// 	update(dt/*eltelt idő*/) {
// 		// növeljük a figura saját idejét
// 		this.#time += dt
// 		// Egy kis fizika:
// 		// 1. A sebesség megváltozása = gyorsulás * eltelt idő
// 		this.#vel.x += this.#acc.x * dt
// 		this.#vel.y += this.#acc.y * dt

// 		// 2. A hely (pozíció) megváltozása = sebesség * eltelt idő
// 		this.#pos.x += this.#vel.x * dt
// 		this.#pos.y += this.#vel.y * dt

// 		// 3. Módosítjuk a HTML elem helyét (translate = eltolás), és ...
// 		let transform = `translate(${this.#pos.x}px, ${this.#pos.y}px)`;
// 		// ... forgatását és
// 		transform += ` rotateX(${this.#rotate.x})`
// 		transform += ` rotateY(${this.#rotate.y})`
// 		transform += ` rotateZ(${this.#rotate.z})`
// 		// ... méretezését
// 		transform += ` scale(${this.#scale.x}, ${this.#scale.y})`
// 		this.#element.style.transform = transform

// 		// ... az elem szélességét és magasságát is.
// 		this.#element.style.width = this.#width + 'px';
// 		this.#element.style.height = this.#height + 'px';
// 	}

// 	// A figurát meg kell jeleníteni. Az alábbi kódblokk feladata ez lenne,
// 	// de HTML megjelenítés esetén ezt a feladatot átveszi a böngésző. Elegendő
// 	// volt annyi, hogy korábban a figura HTML elemét hozzáadtuk a weboldalhoz.
// 	render() {
// 		for (let cn of this.#classList) {
// 			this.#element.classList.add(cn)
// 		}
// 	}

// 	isMoving() {
// 		if (this.vel.x != 0 || this.vel.y != 0) return true;
// 		return false;
// 	}

// 	// A játéknak fontos feladata, hogy kezelni tudja a különböző figurák ütközését.
// 	// Ehhez ismernie kell a figura által lefedett terülelet. Ezt egy téglalappal írhatjuk le úgy,
// 	// hogy a bal felső sarka a figura helye (x, y) a szélessége (w) és magassága (h) pedig
// 	// a figura szélessége és magassága. 
// 	getBounds() {
// 		return new Rect(
// 				this.#pos.x, this.#pos.y,
// 				this.#pos.x + this.#width, this.#pos.y + this.#height)
// 	}

// 	onCollision(entity) {
// 		//console.log(this.id + ' vs ' + entity.id);
// 	}

// 	// A figuránk meg is semmisülhet, eltűnhet a világunkból. Az alábbi kódblokk ezt végzi el.
// 	destroy() {
// 		this.#game.level.removeEntity(this);
// 	}
// }

export default class Entity {
    id
    isActive = true

    // Transform (simulation space)
    position = { x: 0, y: 0 }
    size     = { w: 0, h: 0 }
	scale	 = { x: 1, y: 1 }

    // Kinematics
    velocity     = { x: 0, y: 0 }
    acceleration = { x: 0, y: 0 }
	mass		 = 1
	flexibility	 = 0.4

    // Physics participation
    isUpdated	= true
    isStatic    = false
	canCollide  = false

    // Collision
    collider    				// AABB for now

	renderer = null				// renderer component

	constructor(id, x, y, w, h) {
		this.id = id
		this.position.x = x
		this.position.y = y
		this.size.w = w
		this.size.h = h
	}

	getBounds() {
		return new Rect(
			this.position.x,
			this.position.y,
			this.position.x + this.size.w * this.scale.x,
			this.position.y + this.size.h * this.scale.y
		)
	}

	update(dt) {
		this.integrate(dt)
	}

	integrate(dt) {
		this.velocity.x += this.acceleration.x * dt
		this.velocity.y += this.acceleration.y * dt

		this.position.x += this.velocity.x * dt
		this.position.y += this.velocity.y * dt
	}

	onCollision(other, collisionInfo) {
    	// default: no-op
		return true
	}

	destroy() {
		// default: no-op
	}
}