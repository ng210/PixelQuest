import Block from '../entities/block.js'
import Platform from '../entities/platform.js'
import Player from '../entities/player.js'
import Pixel from '../entities/pixel.js'
import Coin from '../entities/coin.js'
import Life from '../entities/life.js'
// import Gate from './entities/gate.js'

export default class LevelManager {
	static #gravity = 400   // gravitáció

    #worldSize              // a teljes játéktér mérete
    #blockSize			    // egy blokk mérete
    #services

    #entities			    // figurák listája
    #currentLevel           // a pálya adatai
    #playerStartPosition    // játékos kezdő pozíciója
    #player                 // játékos figurája

    get gravity() { return LevelManager.#gravity }
    get playerStartPosition() { return this.#playerStartPosition }
    get entities() { return this.#entities }
    get player() { return this.#player }
    get worldSize() { return this.#worldSize }
    get blockSize() { return this.#blockSize }

    //get coins() { return this.#entities.filter(e => e instanceof Coin) }

    constructor(services, blockSize) {
        this.#services = services
        this.#blockSize = { ...blockSize }
        this.#worldSize = { width: 0, height: 0 }
        this.#entities = []
        this.#playerStartPosition = { x: 0, y:0 }
    }

    cleanLevel() {
        this.#entities = []
    }

    //#region Entity management
    addEntity(entity) {
		if (this.#entities.indexOf(entity) == -1) {
			this.#entities.push(entity)
		} else {
			console.warn('Entity már létezik!')
		}
		return entity
	}

	removeEntity(entity) {
		let ix = this.#entities.indexOf(entity)
		if (ix != -1) {
			this.#entities.splice(ix, 1)
			// if (entity.element.parentNode != null) {
			// 	this.worldElement.removeChild(entity.element)
			// }
		} else console.warn('Entity nem található!')
		return entity
	}
    //#endregion

    //#region Level management
    async loadLevel(path) {
        let levelData = await fetch(path).then(resp => {
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

        function createBlock(type) {
            let block = {
                "type": type,
                "x":lastBlock.x, "y":lastBlock.y,
                "subtype": lastBlock.subtype,
                "width":lastBlock.width, "height":lastBlock.height
            }
            if (type == 'Platform') {
                movingBlocks.push(block)
            }
            return block
        }

        let lines = text.split('\n')
        let data = {}
        let counters = {
            'Block': 0,
            'Coin': 0,
            'Life': 0,
            'Default': 0
        }
        const blockWidth = this.blockSize.width
        const blockHeight = this.blockSize.height
        let movingBlocks = []
        let lastBlock = { x: -1, y: 0, width: 0, height: 0, move: false, subtype:'1' }
        let y = 0
        let li = 0
        for (; li<lines.length-2; li++) {
            let line = lines[li+2]
            if (line == '') break
            let x = 0
            for (let i=0; i<line.length - 2; i+=2) {
                let ch = line[i+2].toUpperCase()
                switch (ch) {
                    case ' ':
                        break
                    case 'C':
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
                            lastBlock.type = 'Block'
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
                    case 'P':
                        if (lastBlock.x == -1) {
                            lastBlock.x = x
                            lastBlock.y = y
                            lastBlock.width = blockWidth
                            lastBlock.type = 'Platform'
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
                if (lastBlock.x != -1 && ch != lastBlock.type.charAt(0)) {
                    const block = createBlock(lastBlock.type)
                    data[block.type.charAt(0)+counters.Block] = block
                    counters.Block++
                    lastBlock.x = -1
                    lastBlock.subtype = '1'
                }
                x += blockWidth
            }
            if (lastBlock.x != -1) {
                const block = createBlock(lastBlock.type)
                data[block.type.charAt(0)+counters.Block] = block
                counters.Block++
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
        this.cleanLevel()

        let width = 0
        let height = 0

        for (let name in lvlData) {
            let item = lvlData[name]
            let entity = null
            // Objektum gyár
            switch (item.type) {
                case 'Player':
                    this.#playerStartPosition.x = item.x
                    this.#playerStartPosition.y = item.y
                    entity = new Player(name, item.x, item.y, this.#services);
                    this.#player = entity
                    entity.canCollide = true
                    this.#player.acceleration.y = LevelManager.#gravity
                    let pixel = this.addEntity(new Pixel('PIX', 0, 200, 40, 40))
                    pixel.player = this.#player
                    pixel.canCollide = false
                    break
                case 'Block':
                    entity = new Block(name, item.x, item.y, item.width, item.height, item.subtype)
                    entity.canCollide = true
                    break
                case 'Platform':
                    entity = new Platform(name, item.x, item.y, item.width, item.height, item.path, item.speed)
                    entity.canCollide = true
                    break
                case 'Coin':
                    entity = new Coin(name, item.x, item.y)
                    break
                case 'Life':
                    entity = new Life(name, item.x, item.y, item.width, item.height)
                    break
                // case 'Gate': entity = new Gate(this.#game, name, item.x, item.y, item.fee); break
            }
            if (entity) {
                this.addEntity(entity)
                let wi = entity.position.x + entity.size.w
                if (width < wi) width = wi
                let he = entity.position.y + entity.size.h
                if (height < he) height = he
            }
        }
        this.#worldSize.width = width
        this.#worldSize.height = height
    }

    handleCollisions() {
        const entities = this.#entities

        for (let i = 0; i < entities.length; i++) {
            const e1 = entities[i]
            if (!e1.isActive || !e1.canCollide) continue
            for (let j = i + 1; j < entities.length; j++) {
                const e2 = entities[j]
                if (!e2.isActive || !e2.canCollide) continue
                if (!e1.isUpdated && !e2.isUpdated) continue
                const info = this.#services.collisionResolver.test(e1, e2)
                if (info.isCollision) {
                    this.#services.collisionResolver.resolveCollision(e1, e2,info)
                }
            }
        }
    }
    //#endregion
}