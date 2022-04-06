import { Vec as BaseVec } from "./core.js";
import { tokenizeStructDef, ERR_PREFIX, createVecDef, validateCompileOptions } from "./compiler.js";
export { Vec } from "./core.js";
export function validateStructDef(def) {
    try {
        tokenizeStructDef(def);
        return true;
    }
    catch (_a) {
        return false;
    }
}
export function vec(structDef) {
    if (typeof SharedArrayBuffer === "undefined") {
        throw new Error(`${ERR_PREFIX} sharedArrayBuffers are not supported in this environment and are required for vecs`);
    }
    const tokens = tokenizeStructDef(structDef);
    const { def, className } = createVecDef(tokens, structDef, {
        lang: "js",
        exportSyntax: "none",
        pathToLib: "none",
        className: "AnonymousVec",
        runtimeCompile: true
    });
    const genericVec = Function(`"use strict";return (Vec) => {
        ${def}
        return ${className}
    }`)()(BaseVec);
    return genericVec;
}
export function vecCompile(structDef, pathToLib, options = {}) {
    const { lang = "js", exportSyntax = "none", className = "AnonymousVec" } = options;
    const compilerArgs = {
        lang,
        pathToLib,
        className,
        exportSyntax,
        runtimeCompile: false
    };
    validateCompileOptions(compilerArgs);
    const tokens = tokenizeStructDef(structDef);
    const { def } = createVecDef(tokens, structDef, compilerArgs);
    return def;
}
export default {
    vec,
    Vec: BaseVec,
    validateStructDef,
    vecCompile
};
