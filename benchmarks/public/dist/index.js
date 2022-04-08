import { Vec as BaseVec } from "./core.js";
import { tokenizeStructDef, ERR_PREFIX, createVecDef, validateCompileOptions, invalidClassName } from "./compiler.js";
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
export function vec(structDef, options = {}) {
    if (typeof SharedArrayBuffer === "undefined") {
        throw new Error(`${ERR_PREFIX} sharedArrayBuffers are not supported in this environment and are required for vecs`);
    }
    const tokens = tokenizeStructDef(structDef);
    const { className = "AnonymousVec" } = options;
    if (invalidClassName(className)) {
        throw SyntaxError(`inputted class name (className option) is not a valid javascript class name, got "${className}"`);
    }
    const { def, className: clsName } = createVecDef(tokens, structDef, {
        lang: "js",
        exportSyntax: "none",
        pathToLib: "none",
        className,
        runtimeCompile: true
    });
    const genericVec = Function(`"use strict";return (Vec) => {
        ${def}
        return ${clsName}
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
