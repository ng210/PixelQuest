import Collectible from "./collectible.js";

export default class Life extends Collectible {
    constructor(game, id, x, y, callback) {
        super(game, id, x, y, 24, 32, 'life');
        this.down = false;
        this.callback = callback;
    }
}