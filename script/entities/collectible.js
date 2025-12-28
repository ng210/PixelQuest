import Entity from "./entity.js";

export default class Collectible extends Entity {
    isCollectable

    constructor(id, x, y, wi, he, className) {
        super(id, x, y, wi, he, className)
        this.isCollectable = true
        this.isStatic = true
        this.canCollide = true
    }

    collect() {
        this.canCollide = false
		this.destroy()
	}
}