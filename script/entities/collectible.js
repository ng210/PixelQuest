import Entity from "./entity.js";

export default class Collectible extends Entity {
    isCollectable

    constructor(game, id, x, y, wi, he, className) {
        super(game, id, x, y, wi, he, className);
        this.isCollectable = true
    }

    collect() {
		this.destroy();
	}
}