export default class Renderer {
    #entity         // entity to render
    get entity() { return this.#entity }

    constructor(entity) {
        this.#entity = entity
    }

    render(a) {
        // default: no-op
    }
}