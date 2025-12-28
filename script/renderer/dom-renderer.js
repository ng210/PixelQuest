import Renderer from "./renderer.js";

export default class DomRenderer extends Renderer {
    #hostElement   // The DOM container where entities will be appended
    #classList     // Default CSS classes for the rendered element
    
    constructor(entity, hostElement, classList = []) {
        super(entity)
        this.#hostElement = hostElement
        this.#classList = Array.isArray(classList) ? classList : []

        // Make sure hostElement is a DOM node
        if (!(hostElement instanceof HTMLElement)) {
            throw new Error("DomRenderer: hostElement must be an HTMLElement")
        }
    }

    // Render an entity in the DOM
    // @param {float} alpha - The interpolation factor for smooth rendering
    render(alpha) {
        const entity = this.entity
        if (!entity.element) {
            // Create a DOM element for this entity if it doesn't exist
            entity.element = document.createElement('div')

            // Add default class and any extra classes from renderer
            entity.element.classList.add(...this.#classList)

            // Append to host container
            this.#hostElement.appendChild(entity.element)
        }

        // Update position and transform
        const transformParts = []

        // Translation
        transformParts.push(`translate(${entity.position.x}px, ${entity.position.y}px)`)

        // Rotation
        if (entity.rotate) {
            transformParts.push(`rotateX(${entity.rotate.x}deg)`)
            transformParts.push(`rotateY(${entity.rotate.y}deg)`)
            transformParts.push(`rotateZ(${entity.rotate.z}deg)`)
        }

        // Scale
        if (entity.scale) {
            transformParts.push(`scale(${entity.scale.x}, ${entity.scale.y})`)
        }

        entity.element.style.transform = transformParts.join(' ')

        // Width and height
        entity.element.style.width = entity.size.w + 'px'
        entity.element.style.height = entity.size.h + 'px'

        // Optional: visibility / active state
        entity.element.style.display = entity.isActive ? 'block' : 'none'
    }
}
