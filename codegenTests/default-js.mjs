import {Vec} from "../dist"
/**
 * @extends {Vec<{"x":"bool","y":"f32","z":"char"}>}
 */
class DefaultJs extends Vec {
    static def = {"x":"bool","y":"f32","z":"char"}
    static elementSize = 3
    static Cursor = class DefaultJsCursor {
        
        constructor(self, index) { this.self = self;this._viewingIndex = index}
        get y() { return this.self._f32Memory[this._viewingIndex] }; set y(newValue) { this.self._f32Memory[this._viewingIndex] = newValue };
        
        get z() { return String.fromCodePoint(this.self._i32Memory[this._viewingIndex + 1] || 32) }; set z(newValue) { this.self._i32Memory[this._viewingIndex + 1] = newValue.codePointAt(0) || 32 };
        get x() { return Boolean(this.self._i32Memory[this._viewingIndex + 2] & 1) }; set x(newValue) { this.self._i32Memory[this._viewingIndex + 2] &= -2;this.self._i32Memory[this._viewingIndex + 2] |= Boolean(newValue)};
        set e({y, z, x}) { this.y = y;this.z = z;this.x = x; }
        get e() { return {y: this.y, z: this.z, x: this.x} }
        get ref() { return new DefaultJs.Cursor(this.self, this._viewingIndex) }
        index(index) { this._viewingIndex = index * this.self.elementSize; return this }
    }
    get elementSize() { return 3 }
    get def() { return {"x":"bool","y":"f32","z":"char"} }
    get cursorDef() { return DefaultJs.Cursor }
}

export default {DefaultJs}