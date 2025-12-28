import Entity from "./entity.js";

export default class Block extends Entity {
    type
    constructor(id, x, y, w, h, type) {
        super(id, x, y, w, h);
        this.type = 'b' + type;
        this.isStatic = true;
    }
}