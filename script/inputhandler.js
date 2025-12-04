/* ---------- InputHandler: billentyűzet + egyszerű gamepad lehetőség ---------- */
export default class InputHandler {
    constructor() {
        this.keys = {};
        this.left = false; this.right = false; this.up = false;
        window.addEventListener('keydown', e => this._onKey(e, true));
        window.addEventListener('keyup', e => this._onKey(e, false));
    }
    _onKey(e, down) {
        const k = e.code;
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'Space', 'KeyA', 'KeyD', 'KeyW'].includes(k)) {
            e.preventDefault();
        }
        if (k === 'ArrowLeft' || k === 'KeyA') { this.left = down; }
        if (k === 'ArrowRight' || k === 'KeyD') { this.right = down; }
        if (k === 'ArrowUp' || k === 'Space' || k === 'KeyW') { this.up = down; }
        this.keys[k] = down;
    }
}