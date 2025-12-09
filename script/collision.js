/*
 * Detects and resolves collision between two axis-aligned rectangles.
 * Returns:
 * {
 *   collide: boolean,
 *   correction: { x, y },  // how to move rect A to fix overlapping
 *   velocityMask: { x, y } // 1 or 0 values indicating allowed motion
 * }
 * rect = { x, y, width, height }
 */
// Az alábbi függvény összetettebb, mert
// - több matematikai hátteret igényel,
// - több JavaScript ismeret szükséges.
// Milyen szerencse, hogy megkaptuk és nem magunknak kell megírnunk!
// A függvény feladata az, hogy a neki átadott a és b téglalapról
// eldönti, hogy fedik-e egymást, azaz ütköznek-e.
// Ha ütköznek, akkor megadja, hogy
// - mennyire kell az ütköző téglalapot elmozdítani, hogy
// éppen ne legyen ütközés,
// - a téglalap melyik irányba "mozoghat" és melyikbe nem.
export default function resolveAABBCollision(a, b) {
    // Számítsuk ki a téglalapok középpontjainak koordinátáit
    const aCenterX = a.x + a.w / 2
    const aCenterY = a.y + a.h / 2
    const bCenterX = b.x + b.w / 2
    const bCenterY = b.y + b.h / 2

    // Most számítsuk ki a két középpont távolságát
    const dx = aCenterX - bCenterX
    const dy = aCenterY - bCenterY

    // A legkisebb távolság a két középpont között,
    // amikor még nem fedik egymást a téglalapok:
    const minDistX = (a.w + b.w) / 2
    const minDistY = (a.h + b.h) / 2

    const result = {
        collides: false,
        correction: { x: 0, y: 0 },
        velocityMask: { x: 1, y: 1 },
        direction: { left: false, top: false, right: false, bottom: false }
    }
    // A fenti előkészület után jöhet az ütközés vizsgálata!
    // Ha a téglalap középpontjainak távolsága x és y irányban
    // is kisebb mint a minimális távolság, akkor ütközés van.
    if (Math.abs(dx) < minDistX && Math.abs(dy) < minDistY) {
        // Nézzük mennyire lóg az egyik téglalap a másikba
        const overlapX = minDistX - Math.abs(dx)
        const overlapY = minDistY - Math.abs(dy)
        result.collides = true
        // A kisebb "belógás" alapján folytatjuk
        if (overlapX < overlapY) {
            if (dx < 0) {
                result.correction.x = -overlapX
                result.velocityMask.x = 0
                result.direction.right = true
            } else {
                result.correction.x = overlapX
                result.velocityMask.x = 0
                result.direction.left = true
            }
        } else {
            if (dy < 0) {
                result.correction.y = -overlapY
                result.velocityMask.y = 0
                result.direction.bottom = true
            } else {
                result.correction.y = overlapY
                result.velocityMask.y = 0
                result.direction.top = true
            }
        }
    }

    return result
}
