import RendererFactory from "./renderer-factory.js"
import DomRenderer from "./dom-renderer.js"

export default class DomRendererFactory extends RendererFactory {
    constructor(initData) {
        super('DOM', initData)
    }

    createRenderer(entity) {
        const type = entity.constructor.name
        switch (type) {
            case 'Life':
                entity.renderer = new DomRenderer(entity, this.initData, ['entity', 'life'])
                break
            case 'Coin':
                entity.renderer = new DomRenderer(entity, this.initData, ['entity', 'coin'])
                break
            case 'Block':
                entity.renderer = new DomRenderer(entity, this.initData, ['entity', 'block', entity.type])
                break
            case 'Platform':
                entity.renderer = new DomRenderer(entity, this.initData, ['entity', 'platform'])
                break
            case 'Player':
                entity.renderer = new DomRenderer(entity, this.initData, ['entity', 'player'])
                break
            case 'Pixel':
                entity.renderer = new DomRenderer(entity, this.initData, ['entity', 'pixel'])
                break
            case 'Gate':
                entity.renderer = new DomRenderer(entity, this.initData, ['entity', 'gate', 'locked'])
                break
            default:
                entity.renderer = new DomRenderer(entity, this.initData, ['entity'])
            break
        }
        return 
    }
}