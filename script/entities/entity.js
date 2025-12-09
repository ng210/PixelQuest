// Entity: alap osztály minden játékbeli figurához
export default class Entity {
	#id							// a figura azonosítója
	#game						// a játék példánya
	#pos = { x:0, y:0 }			// a figura helye (x, y koordináta)
	#width						// a figura szélessége pixelben
	#height						// a figura magassága pixelben
	#scale = { x:1, y:1 }		// a figura méretezése (nagyítás-kicsinyítés)
	#rotate = { x:0, y:0, z:0 }	// a figura méretezése (nagyítás-kicsinyítés)
	#className					// a figura CSS osztálya (megjelenítés)
	#vel = { x:0, y:0 }			// a figura sebessége (vizszintes és függőleges irányban)
	#acc = { x:0, y:0 }		// a figura gyorsulása (vizszintes és függőleges irányban)
	#element = null				// a figurát megjelenítő HTML (weboldali) elem
	#time						// a figura saját ideje, amit animációhoz használ
	#isActive					// aktív a figura vagy figyelmen kívül lehet hagyni?
	
	// #region olvasás (get) elérés
	get id() { return this.#id }
	get game() { return this.#game }
	get pos() { return this.#pos }
	get width() { return this.#width }
	set width(wi) { this.#width = wi }
	get height() { return this.#height }
	set height(he) { this.#height = he }
	get scale() { return this.#scale }
	get rotate() { return this.#rotate }
	get className() { return this.#className }
	get vel() { return this.#vel }
	get acc() { return this.#acc }
	get element() { return this.#element }
	get time() { return this.#time }
	get isActive() { return this.#isActive }
	set isActive(value) { this.#isActive = !!value }


	//#endregion

	// A figuránkat le kell gyártani, meg kell konstruálni, azaz ki kell tölteni adatokkal.
	// Az alábbi kódblokk (metódus) ezt végzi el.
	constructor(game, id, x, y, w, h, className = '') {
		this.#id = id
		this.#game = game
		this.#pos.x = x; this.#pos.y = y
		this.#width = w; this.#height = h
		this.#vel.x = 0; this.#vel.y = 0
		this.#acc.x = 0; this.#acc.y = 0
		this.#className = className
		this.#time = 0
		this.#isActive = true

		// A HTML alapú megjelenítés nagyon egyszerű:
		//	- hozzuk létre a HTML elemet (div)
			this.#element = document.createElement('div')
		//	- állítsuk be néhány tulajdonságát
		//	  például az azonosítóját, vagy
			this.#element.id = this.#id
		//	  a megjelenítés sablonját (CSS osztály) 
			this.#element.className = 'entity ' + className
	}

	// A figura időben változhat, mozoghat. Az alábbi kódblokk kiszámolja a figura helyét
	// és sebességét, ezután módosítja a megjelenését.
	update(dt/*eltelt idő*/) {
		// növeljük a figura saját idejét
		this.#time += dt
		// Egy kis fizika:
		// 1. A sebesség megváltozása = gyorsulás * eltelt idő
		this.#vel.x += this.#acc.x * dt
		this.#vel.y += this.#acc.y * dt

		// 2. A hely (pozíció) megváltozása = sebesség * eltelt idő
		this.#pos.x += this.#vel.x * dt
		this.#pos.y += this.#vel.y * dt

		// 3. Módosítjuk a HTML elem helyét (translate = eltolás), és ...
		this.#element.style.transform = `translate(${this.#pos.x}px, ${this.#pos.y}px)`;
		// ... forgatását és
		this.#element.style.transform += ` rotateX(${this.#rotate.x})`
		this.#element.style.transform += ` rotateY(${this.#rotate.y})`
		this.#element.style.transform += ` rotateZ(${this.#rotate.z})`
		// ... méretezését
		this.#element.style.transform += ` scale(${this.#scale.x}, ${this.#scale.y})`
		// ... az elem szélességét és magasságát is.
		this.#element.style.width = this.#width + 'px';
		this.#element.style.height = this.#height + 'px';
	}

	// A figurát meg kell jeleníteni. Az alábbi kódblokk feladata ez lenne,
	// de HTML megjelenítés esetén ezt a feladatot átveszi a böngésző. Elegendő
	// volt annyi, hogy korábban a figura HTML elemét hozzáadtuk a weboldalhoz.
	render() {
	}

	isMoving() {
		if (this.vel.x != 0 || this.vel.y != 0) return true;
		return false;
	}

	// A játéknak fontos feladata, hogy kezelni tudja a különböző figurák ütközését.
	// Ehhez ismernie kell a figura által lefedett terülelet. Ezt egy téglalappal írhatjuk le úgy,
	// hogy a bal felső sarka a figura helye (x, y) a szélessége (w) és magassága (h) pedig
	// a figura szélessége és magassága. 
	getBounds() {
		return { x:this.#pos.x, y:this.#pos.y, w:this.#width, h:this.#height };
	}

	onCollision(entity) {
		//console.log(this.id + ' vs ' + entity.id);
	}

	// A figuránk meg is semmisülhet, eltűnhet a világunkból. Az alábbi kódblokk ezt végzi el.
	destroy() {
		this.#game.removeEntity(this);
	}
}