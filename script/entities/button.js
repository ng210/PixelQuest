import Entity from "./entity.js";

/* ---------- Button (nyomó) ---------- */
export default class Button extends Entity {
    constructor(game, id, x, y, callback) {
        super(game, id, x, y, 36, 12, 'button');
        this.down = false;
        this.callback = callback;
    }
    press() {
        if (this.down) return;
        this.down = true;
        this.el.classList.add('down');
        if (this.callback) this.callback();
    }
}