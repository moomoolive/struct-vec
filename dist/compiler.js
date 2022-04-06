"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVecDef = exports.validateCompileOptions = exports.tokenizeStructDef = exports.ERR_PREFIX = void 0;
const core_1 = require("./core");
// Allows for alpha-numeric characters, $, and _.
// Numbers are not allow to be the first character.
const ALLOW_CHARACTERS_IN_VARIABLE_NAME = /^[A-Za-z_\\$][A-Za-z0-9_\\$]*$/;
exports.ERR_PREFIX = "[VecGenerator]";
function validVariableName(candidate) {
    return ALLOW_CHARACTERS_IN_VARIABLE_NAME.test(candidate);
}
function validType(type) {
    switch (type) {
        case "f32":
        case "i32":
        case "bool":
        case "char":
            return true;
        default:
            return false;
    }
}
function restrictedFieldName(name) {
    switch (name) {
        case "self":
        case "e":
        case "_viewingIndex":
        case "ref":
        case "isNull":
            return true;
        default:
            return false;
    }
}
const BITS_IN_I32 = 32;
function tokenizeStructDef(def) {
    if (typeof def !== "object" || def === null || Array.isArray(def)) {
        throw SyntaxError(`${exports.ERR_PREFIX} inputted invalid struct def. Expected object in the form of '{"field1": "f32", "field2": "char", "field3": "bool"}' got ${JSON.stringify(def)}`);
    }
    const fieldDefs = Object.keys(def).map((key) => {
        return { field: key, type: def[key] };
    });
    if (fieldDefs.length < 1) {
        throw SyntaxError(`${exports.ERR_PREFIX} struct definition must have at least one key`);
    }
    let elementSize = 0;
    const tokens = {
        elementSize: 0,
        fieldNames: [],
        float32Fields: [],
        int32Fields: [],
        booleanFields: [],
        charFields: []
    };
    const float32Types = [];
    const int32Types = [];
    const boolTypes = [];
    const charTypes = [];
    for (let i = 0; i < fieldDefs.length; i += 1) {
        const { field, type } = fieldDefs[i];
        if (typeof field !== "string" || !validVariableName(field)) {
            throw SyntaxError(`${exports.ERR_PREFIX} Bracket notation is disallowed, all structDef must be indexable by dot notation. Field "${field}" of struct requires indexing as "vec['${field}']" which is disallowed. Consider removing any hyphens.`);
        }
        else if (restrictedFieldName(field)) {
            throw SyntaxError(`${exports.ERR_PREFIX} field "${field}" is a reserved name.`);
        }
        if (typeof type !== "string") {
            throw SyntaxError(`${exports.ERR_PREFIX} field "${field}" is not a string, got "${typeof type}". Struct definition field values must be a string of ${core_1.VALID_DATA_TYPES_INTERNAL.join(", ")}`);
        }
        else if (!validType(type)) {
            throw SyntaxError(`${exports.ERR_PREFIX} field "${field}" is not a valid type (got type "${type}"). Struct definition fields can only be of type of ${core_1.VALID_DATA_TYPES_INTERNAL.join(", ")}`);
        }
        switch (type) {
            case "f32":
                float32Types.push(field);
                break;
            case "i32":
                int32Types.push(field);
                break;
            case "bool":
                boolTypes.push(field);
                break;
            case "char":
                charTypes.push(field);
                break;
        }
    }
    float32Types.sort();
    for (let i = 0; i < float32Types.length; i += 1) {
        const field = float32Types[i];
        tokens.fieldNames.push(field);
        tokens.float32Fields.push({
            field,
            offset: elementSize
        });
        elementSize += 1;
    }
    int32Types.sort();
    for (let i = 0; i < int32Types.length; i += 1) {
        const field = int32Types[i];
        tokens.fieldNames.push(field);
        tokens.int32Fields.push({
            field,
            offset: elementSize
        });
        elementSize += 1;
    }
    charTypes.sort();
    for (let i = 0; i < charTypes.length; i += 1) {
        const field = charTypes[i];
        tokens.fieldNames.push(field);
        tokens.charFields.push({
            field,
            offset: elementSize
        });
        elementSize += 1;
    }
    boolTypes.sort();
    let start = 0;
    while (start < boolTypes.length) {
        const boolsLeft = boolTypes.length - start;
        const end = boolsLeft < BITS_IN_I32
            ? boolsLeft
            : BITS_IN_I32;
        for (let i = start; i < start + end; i += 1) {
            const field = boolTypes[i];
            tokens.fieldNames.push(field);
            tokens.booleanFields.push({
                field,
                offset: elementSize,
                byteOffset: i - start
            });
        }
        elementSize += 1;
        start += BITS_IN_I32;
    }
    tokens.elementSize = elementSize;
    return tokens;
}
exports.tokenizeStructDef = tokenizeStructDef;
function reservedJsKeyword(word) {
    switch (word) {
        case "false":
        case "true":
        case "null":
        case "await":
        case "static":
        case "public":
        case "protected":
        case "private":
        case "package":
        case "let":
        case "interface":
        case "implements":
        case "yield":
        case "with":
        case "while":
        case "void":
        case "var":
        case "typeof":
        case "try":
        case "throw":
        case "this":
        case "switch":
        case "super":
        case "return":
        case "new":
        case "instanceof":
        case "in":
        case "import":
        case "if":
        case "function":
        case "for":
        case "finally":
        case "extends":
        case "export":
        case "else":
        case "do":
        case "delete":
        case "default":
        case "debugger":
        case "continue":
        case "const":
        case "class":
        case "catch":
        case "case":
        case "break":
            return true;
        default:
            return false;
    }
}
function validateCompileOptions(input) {
    if (typeof input !== "object"
        || input === null
        || Array.isArray(input)) {
        throw TypeError(`input options must be of type "object", got type "${typeof input}"`);
    }
    if (typeof input.pathToLib !== "string"
        || !input.pathToLib) {
        throw TypeError("option 'pathToLib' missing");
    }
    if (typeof input.className !== "string"
        || !validVariableName(input.className)
        || reservedJsKeyword(input.className)
        || input.className.length < 1) {
        throw SyntaxError(`inputted class name is not a valid javascript class name, got "${input.className}"`);
    }
    switch (input.exportSyntax) {
        case "named":
        case "default":
        case "none":
            break;
        default:
            throw TypeError("invalid export Syntax option. exportSyntax must be either 'none', 'named', or 'default', got '" + input.exportSyntax + "''");
    }
    if (input.lang !== "js" && input.lang !== "ts") {
        throw TypeError(`option "bindings" must be either "js" or "ts". Got "${input.bindings}"`);
    }
}
exports.validateCompileOptions = validateCompileOptions;
function createVecDef(tokens, structDef, { lang, pathToLib, className, exportSyntax, runtimeCompile }) {
    const { elementSize, fieldNames, float32Fields, booleanFields, charFields, int32Fields } = tokens;
    const def = JSON.stringify(structDef);
    const ts = lang === "ts";
    const generic = `<${def}>`;
    const libPath = `"${pathToLib}"`;
    const importStatement = `import {Vec${ts ? ", StructDef, Struct, CursorConstructor" : ""}} from ${libPath}`;
    const CursorConstructor = "CursorConstructor" + generic;
    const memory = ts ?
        "(this.self as unknown as {_f32Memory: Float32Array})._f32Memory"
        : "this.self._f32Memory";
    const intMemory = ts ?
        "(this.self as unknown as {_i32Memory: Int32Array})._i32Memory"
        : "this.self._i32Memory";
    return {
        className,
        def: `
${pathToLib !== "none" ? importStatement : ""}
${ts || runtimeCompile
            ? ""
            : `/**
 * @extends {Vec${generic}}
 */`}
${exportSyntax === "named" ? "export " : ""}class ${className} extends Vec${ts ? generic : ""} {
    ${ts ? "protected " : ""}static Cursor = class Cursor {
        _viewingIndex = 0${ts ? "\n\t\tself: Vec" + generic : ""}
        constructor(self${ts ? ": Vec" + generic : ""}) { this.self = self }
        ${float32Fields.map(({ field, offset }) => {
            const fieldOffset = offset < 1 ? "" : (" + " + offset.toString());
            const base = `${memory}[this._viewingIndex${fieldOffset}]`;
            const type = ts ? ": number" : "";
            const getter = `get ${field}()${type} { return ${base} }`;
            const setter = `set ${field}(newValue${type}) { ${base} = newValue }`;
            return `${getter}; ${setter};`;
        }).join("\n\t    ")}
        ${int32Fields.map(({ field, offset }) => {
            const fieldOffset = offset < 1 ? "" : (" + " + offset.toString());
            const base = `${intMemory}[this._viewingIndex${fieldOffset}]`;
            const type = ts ? ": number" : "";
            const getter = `get ${field}()${type} { return ${base} }`;
            const setter = `set ${field}(newValue${type}) { ${base} = newValue }`;
            return `${getter}; ${setter};`;
        }).join("\n\t    ")}
        ${charFields.map(({ field, offset }) => {
            const fieldOffset = offset < 1 ? "" : (" + " + offset.toString());
            const base = `${intMemory}[this._viewingIndex${fieldOffset}]`;
            const type = ts ? ": string" : "";
            const getter = `get ${field}()${type} { return String.fromCodePoint(${base} || ${32 /* spaceCharacteCodePoint */}) }`;
            const setter = `set ${field}(newValue${type}) { ${base} = newValue.codePointAt(0) || ${32 /* spaceCharacteCodePoint */} }`;
            return `${getter}; ${setter};`;
        }).join("\n\t    ")}
        ${booleanFields.map(({ field, offset, byteOffset }) => {
            const fieldOffset = offset < 1 ? "" : (" + " + offset.toString());
            const mask = 1 << byteOffset;
            const reverseMask = ~mask;
            const type = ts ? ": boolean" : "";
            const boolCast = ts ? "(Boolean(newValue) as unknown as number)" : "Boolean(newValue)";
            const base = `${intMemory}[this._viewingIndex${fieldOffset}]`;
            const getter = `get ${field}()${type} { return Boolean(${base} & ${mask}) }`;
            const setter = `set ${field}(newValue${type}) { ${base} &= ${reverseMask};${base} |= ${boolCast}${byteOffset < 1 ? "" : " << " + byteOffset.toString()}}`;
            return `${getter}; ${setter};`;
        }).join("\n\t    ")}
        set e({${fieldNames.map((field) => field).join(", ")}}${ts ? ": Struct" + generic : ""}) { ${fieldNames.map((field) => {
            return "this." + field + " = " + field;
        }).join(";")}; }
        get e()${ts ? ": Struct" + generic : ""} { return {${fieldNames.map((field) => {
            return field + ": this." + field;
        }).join(", ")}} }        
    }${ts ? " as " + CursorConstructor : ""}
    get elementSize()${ts ? ": number" : ""} { return ${elementSize} }
    get def()${ts ? ": StructDef" : ""} { return ${def} }
    ${ts ? "protected " : ""}get cursorDef()${ts ? ": " + CursorConstructor : ""} { return ${className}.Cursor }
}

${exportSyntax === "default" ? `export default {${className}}` : ""}
`.trim()
    };
}
exports.createVecDef = createVecDef;
