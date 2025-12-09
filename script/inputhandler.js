// InputHandler: billentyűzet + egyszerű gamepad lehetőség
const mappedKeys = [
    'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
    'Space',
    'KeyA', 'KeyD', 'KeyW', 'KeyS']

export default class InputHandler {
    #keys = {};

    get left() { return this.#keys.ArrowLeft || this.#keys.KeyA }
    get right() { return this.#keys.ArrowRight || this.#keys.KeyD }
    get up() { return this.#keys.ArrowUp || this.#keys.KeyW }
    get down() { return this.#keys.ArrowDown || this.#keys.KeyS }
    get button1() { return this.#keys.Space || this.#keys.KeyI }
    get button2() { return this.#keys.Space || this.#keys.KeyO }

    constructor() {
        for (let key of mappedKeys) {
            this.#keys[key] = false
        }
        window.addEventListener('keydown', e => this.#onKey(e, true));
        window.addEventListener('keyup', e => this.#onKey(e, false));
    }

    #onKey(e, down) {
        const k = e.code;
        if (this.#keys[k] !== undefined) {
            this.#keys[k] = down;
            e.preventDefault();
        }
    }
}