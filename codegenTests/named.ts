import {Vec, StructDef, Struct, CursorConstructor} from "../dist"

export class NamedTs extends Vec<{"x":"bool","y":"num","z":"char"}> {
    protected static Cursor = class Cursor {
        _viewingIndex = 0
		self: Vec<{"x":"bool","y":"num","z":"char"}>
        constructor(self: Vec<{"x":"bool","y":"num","z":"char"}>) { this.self = self }
        get y(): number { return (this.self as unknown as {_memory: Float64Array})._memory[this._viewingIndex] }; set y(newValue: number) { (this.self as unknown as {_memory: Float64Array})._memory[this._viewingIndex] = newValue };
        get z(): string { return String.fromCodePoint((this.self as unknown as {_memory: Float64Array})._memory[this._viewingIndex + 1] || 32) }; set z(newValue: string) { (this.self as unknown as {_memory: Float64Array})._memory[this._viewingIndex + 1] = newValue.codePointAt(0) || 32 };
        get x(): boolean { return Boolean((this.self as unknown as {_memory: Float64Array})._memory[this._viewingIndex + 2] & 1) }; set x(newValue: boolean) { (this.self as unknown as {_memory: Float64Array})._memory[this._viewingIndex + 2] &= -2;(this.self as unknown as {_memory: Float64Array})._memory[this._viewingIndex + 2] |= (Boolean(newValue) as unknown as number)};
        set e({y, z, x}: Struct<{"x":"bool","y":"num","z":"char"}>) { this.y = y;this.z = z;this.x = x; }
        get e(): Struct<{"x":"bool","y":"num","z":"char"}> { return {y: this.y, z: this.z, x: this.x} }        
    } as CursorConstructor<{"x":"bool","y":"num","z":"char"}>
    get elementSize(): number { return 3 }
    get def(): StructDef { return {"x":"bool","y":"num","z":"char"} }
    protected get cursorDef(): CursorConstructor<{"x":"bool","y":"num","z":"char"}> { return NamedTs.Cursor }
}