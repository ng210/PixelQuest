import Collectible from "./collectible.js";

export default class Life extends Collectible {
    constructor(id, x, y, callback) {
        super(id, x, y, 24, 32);
        this.down = false;
        //this.callback = callback;
    }
}