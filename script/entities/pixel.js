import Entity from "./entity.js";

export default class Pixel extends Entity {
    player = null;
    constructor(id, x, y, w, h) {
        super(id, x, y, w, h);
        this.isStatic = true;
        this.isUpdated = true;
    }

    update(dt) {
        this.velocity.x = (this.player.position.x + 56 - this.position.x) / 1.5;
        this.velocity.y = (this.player.position.y - 20 - this.position.y) / 1.5;
        super.update(dt);
    }
}