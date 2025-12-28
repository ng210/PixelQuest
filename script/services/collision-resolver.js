import CollisionInfo from './collision-info.js'

export default class CollisionResolver {

    // Test collision between two entities
    // Returns CollisionInfo containing:
    // - isCollision
    // - correction vector (minimum translation to resolve)
    // - collision normal (pointing out of e2 relative to e1)
    test(e1, e2) {
        const r1 = e1.getBounds()
        const r2 = e2.getBounds()
        let info = null

        // Compute overlaps
        const overlapX = Math.min(r1.right - r2.left, r2.right - r1.left)
        const overlapY = Math.min(r1.bottom - r2.top, r2.bottom - r1.top)

        if (overlapX > 0 && overlapY > 0) {

            // Determine minimum translation direction and normal
            let dx = 0, dy = 0
            if (overlapX < overlapY) {
                if (r1.x < r2.x) {
                    dx = -overlapX
                } else {
                    dx = overlapX
                }
            } else {
                if (r1.y < r2.y) {
                    dy = -overlapY
                } else {
                    dy = overlapY
                }
            }
            info = new CollisionInfo(true, dx, dy)
        } else {
            info = new CollisionInfo(false, 0, 0)
        }

        return info
    }

    // Apply the collision response based on CollisionInfo
    // Respects entity mass, flexibility, and static status
    resolveCollision(e1, e2, info) {
        if (!info.isCollision || (e1.isStatic && e2.isStatic)) return

        let invInfo = new CollisionInfo(
            info.isCollision,
            -info.correction.x,
            -info.correction.y
        )

        // Masses: static entities are considered "infinite"
        const m1 = e1.isStatic ? Infinity : (e1.mass ?? 1)
        const m2 = e2.isStatic ? Infinity : (e2.mass ?? 1)
        const invM1 = e1.isStatic ? 0 : 1 / m1
        const invM2 = e2.isStatic ? 0 : 1 / m2
        const totalInvMass = invM1 + invM2
        // Split correction according to inverse mass
        const ratio1 = invM1 / totalInvMass
        const ratio2 = invM2 / totalInvMass

        // Compute velocity along collision normal
        const normal = info.normal
        const v1n = e1.velocity.x * normal.x + e1.velocity.y * normal.y
        const v2n = e2.velocity.x * normal.x + e2.velocity.y * normal.y
        // Impulse along normal
        const impulse = -(v1n - v2n) / totalInvMass

        if (e1.onCollision(e2, info)) {
            // Apply position correction
            e1.position.x += info.correction.x * ratio1
            e1.position.y += info.correction.y * ratio1
            if (!e1.isStatic) {
                const i1 = impulse * (1 + e1.flexibility) * invM1
                e1.velocity.x += i1 * normal.x
                e1.velocity.y += i1 * normal.y
            }
        }

        if (e2.onCollision(e1, invInfo)) {
            // Apply position correction
            e2.position.x -= info.correction.x * ratio2
            e2.position.y -= info.correction.y * ratio2
            if (!e2.isStatic) {
                const i2 = impulse * (1 + e2.flexibility) * invM2
                e2.velocity.x -= i2 * normal.x
                e2.velocity.y -= i2 * normal.y
            }
        }
    }
}
