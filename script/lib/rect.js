export default class Rect {
    left
    top
    right
    bottom

    get x() { return this.left }
    get y() { return this.top }
    get w() { return this.right - this.left }
    get h() { return this.bottom - this.top }

    constructor(l, t, r, b) {
        this.left = l
        this.top = t
        this.right = r
        this.bottom = b
    }
}