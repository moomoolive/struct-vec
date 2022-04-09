import {Vec, StructDef, Struct, CursorConstructor, VecCursor, DetachedVecCursor} from "../dist"

class DefaultTs extends Vec<{"x":"bool","y":"f32","z":"char"}> {
    static readonly def: StructDef = {"x":"bool","y":"f32","z":"char"}
    static readonly elementSize: number = 3
    protected static Cursor = class DefaultTsCursor {
        _viewingIndex: number
		self: Vec<{"x":"bool","y":"f32","z":"char"}>
        constructor(self: Vec<{"x":"bool","y":"f32","z":"char"}>, index: number) { this.self = self;this._viewingIndex = index}
        get y(): number { return (this.self as unknown as {_f32Memory: Float32Array})._f32Memory[this._viewingIndex] }; set y(newValue: number) { (this.self as unknown as {_f32Memory: Float32Array})._f32Memory[this._viewingIndex] = newValue };
        
        get z(): string { return String.fromCodePoint((this.self as unknown as {_i32Memory: Int32Array})._i32Memory[this._viewingIndex + 1] || 32) }; set z(newValue: string) { (this.self as unknown as {_i32Memory: Int32Array})._i32Memory[this._viewingIndex + 1] = newValue.codePointAt(0) || 32 };
        get x(): boolean { return Boolean((this.self as unknown as {_i32Memory: Int32Array})._i32Memory[this._viewingIndex + 2] & 1) }; set x(newValue: boolean) { (this.self as unknown as {_i32Memory: Int32Array})._i32Memory[this._viewingIndex + 2] &= -2;(this.self as unknown as {_i32Memory: Int32Array})._i32Memory[this._viewingIndex + 2] |= (Boolean(newValue) as unknown as number)};
        set e({y, z, x}: Struct<{"x":"bool","y":"f32","z":"char"}>) { this.y = y;this.z = z;this.x = x; }
        get e(): Struct<{"x":"bool","y":"f32","z":"char"}> { return {y: this.y, z: this.z, x: this.x} }
        get ref(): VecCursor<{"x":"bool","y":"f32","z":"char"}> { return new DefaultTs.Cursor(this.self, this._viewingIndex) }
        index(index: number): DetachedVecCursor<{"x":"bool","y":"f32","z":"char"}> { this._viewingIndex = index * this.self.elementSize; return this }
    } as CursorConstructor<{"x":"bool","y":"f32","z":"char"}>
    get elementSize(): number { return 3 }
    get def(): StructDef { return {"x":"bool","y":"f32","z":"char"} }
    protected get cursorDef(): CursorConstructor<{"x":"bool","y":"f32","z":"char"}> { return DefaultTs.Cursor }
}

export default {DefaultTs}