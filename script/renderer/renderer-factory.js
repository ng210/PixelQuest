export default class RendererFactory {
    #type = null
    get type() { return this.#type }
    #initData = null
    get initData() { return this.#initData }
    constructor(type, initData) {
        this.#type = type
        this.#initData = initData    // container element, canvas context, etc.
    }

    createRenderer(entity) {
        throw new Error("Not implemented")
    }
}
