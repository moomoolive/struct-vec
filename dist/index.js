"use strict";
/**
 * @module vec-struct
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.vecCompile = exports.vec = exports.validateStructDef = exports.Vec = void 0;
// imports should be one line only => for build system
const core_1 = require("./core");
const compiler_1 = require("./compiler");
var core_2 = require("./core");
Object.defineProperty(exports, "Vec", { enumerable: true, get: function () { return core_2.Vec; } });
/**
 * A helper function to validate an inputted struct
 * definition. If inputted struct def is valid
 * the function true, otherwise it will return
 * false.
 *
 * @param {any} def the struct definition to be validated
 * @returns {boolean}
 *
 * @example <caption>Basic Usage</caption>
 * ```js
 * import {validateStructDef} from "vec-struct"
 *
 * console.log(validateStructDef(null)) // output: false
 * console.log(validateStructDef(true)) // output: false
 * console.log(validateStructDef("def")) // output: false
 * console.log(validateStructDef({x: "randomType"})) // output: false
 * console.log(validateStructDef({x: {y: "num"}})) // output: false
 *
 * console.log(validateStructDef({x: "num"})) // output: true
 * console.log(validateStructDef({code: "num"})) // output: true
 * ```
 */
function validateStructDef(def) {
    try {
        (0, compiler_1.tokenizeStructDef)(def);
        return true;
    }
    catch (_a) {
        return false;
    }
}
exports.validateStructDef = validateStructDef;
/**
 * A vec compiler that can be used at runtime.
 * Creates class definitions for growable array-like
 * data structure (known as a vector or vec for short) that
 * hold fixed-sized objects (known as structs) from
 * your inputted struct definition.
 *
 * Vecs are backed by SharedArrayBuffers and therefore
 * can be passed across threads with zero serialization
 * cost.
 *
 * SAFETY-NOTE: this compiler uses the unsafe `Function`
 * constructor internally. Use`vecCompile` if you
 * wish to avoid unsafe code. Do note, that `vecCompile`
 * can only be used at build time.
 *
 * NOTE: vecs carry fixed-sized, strongly-typed
 * elements that cannot be change once the class is
 * created, unlike normal arrays.
 *
 * @param {StructDef} structDef a type definition for the elements
 * to be carried by an instance of the generated vec
 * class
 * @returns {VecClass<StructDef>} A class that creates vecs which conform
 * to inputted def
 *
 * @example <caption>Basic Usage</caption>
 * ```js
 * import {vec} from "struct-vec"
 *
 * // create Vec definition
 * const PositionV = vec({x: "num", y: "num", z: "num"})
 * // now initialize like a normal class
 * const p = new PositionV()
 *
 * const geoCoordinates = vec({latitude: "num", longitude: "num"})
 * const geo = new geoCoordinates(15).fill({latitude: 1, longitude: 1})
 *
 * // invalid struct defs throws error
 * const errClass = vec(null) // SyntaxError
 * const errClass2 = vec({x: "unknownType"}) // SyntaxError
 * ```
 */
function vec(structDef) {
    if (typeof SharedArrayBuffer === "undefined") {
        throw new Error(`${compiler_1.ERR_PREFIX} sharedArrayBuffers are not supported in this environment and are required for vecs`);
    }
    const tokens = (0, compiler_1.tokenizeStructDef)(structDef);
    const { def, className } = (0, compiler_1.createVecDef)(tokens, structDef, {
        lang: "js",
        exportSyntax: "none",
        pathToLib: "none",
        className: "AnonymousVec",
        runtimeCompile: true
    });
    const genericVec = Function(`"use strict";return (Vec) => {
        ${def}
        return ${className}
    }`)()(core_1.Vec);
    return genericVec;
}
exports.vec = vec;
/**
 * A vec compiler that can be used at build time.
 * Creates class definitions for growable array-like
 * data structure (known as a vector or vec for short) that
 * hold fixed-sized objects (known as structs) from
 * your inputted struct definition.
 *
 * Class definitions created by this compiler are the exact same
 * as the one's created by the runtime compiler.
 *
 * Vecs are backed by SharedArrayBuffers and therefore
 * can be passed across threads with zero serialization
 * cost.
 *
 * NOTE: this compiler does not come will any command line
 * tool, so you as the user must decide how to generate
 * and store the vec classes emitted by this compiler.
 *
 * NOTE: vecs carry fixed-sized, strongly-typed
 * elements that cannot be change once the class is
 * created, unlike normal arrays.
 *
 * @param {StructDef} structDef a type definition for the elements
 * to be carried by an instance of the generated vec
 * class.
 * @param {string} pathToLib where the "struct-vec" library is located
 * use the full url if using compiler in web (without build tool)
 * or deno.
 * @param {Object} [options]
 * @param {("js" | "ts")} [options.bindings="js"] what language should vec class
 * be generated in. Choose either "js" (javascript) or
 * "ts" (typescript). Defaults to "js".
 * @param {("none" | "named" | "default")} [options.exportSyntax="none"] what es6 export
 * syntax should class be generated with. Choose either
 * "none" (no import statement with class), "named" (use
 * the "export" syntax), or "default" (use "export default"
 * syntax). Defaults to "none".
 * @param {string} [options.className="AnonymousVec"] the name of the generated
 * vec class. Defaults to "AnonymousVec".
 * @returns {string} a string rendition of vec class
 *
 * @example <caption>Basic Usage</caption>
 * ```js
 * import fs from "fs"
 * import {vecCompile} from "struct-vec"
 *
 * // the path to the "struct-vec" library.
 * // For the web or deno, you would
 * // put the full url to the library.
 * const LIB_PATH = "struct-vec"
 *
 * // create Vec definition
 * const def = {x: "num", y: "num", z: "num"}
 * const GeneratedClass = vecCompile(def, LIB_PATH, {
 *      // create a typescript class
 *      lang: "ts",
 *      // export the class with "export default"
 *      // syntax
 *      exportSyntax: "default",
 *      className: "GeneratedClass"
 * })
 * console.log(typeof GeneratedClass) // output: string
 * // write the class to disk to use later
 * // // or in another application
 * fs.writeFileSync("GeneratedClass.js", GeneratedClass, {
 *      encoding: "utf-8"
 * })
 * ```
 */
function vecCompile(structDef, pathToLib, options = {}) {
    const { lang = "js", exportSyntax = "none", className = "AnonymousVec" } = options;
    const compilerArgs = {
        lang,
        pathToLib,
        className,
        exportSyntax,
        runtimeCompile: false
    };
    (0, compiler_1.validateCompileOptions)(compilerArgs);
    const tokens = (0, compiler_1.tokenizeStructDef)(structDef);
    const { def } = (0, compiler_1.createVecDef)(tokens, structDef, compilerArgs);
    return def;
}
exports.vecCompile = vecCompile;
exports.default = {
    vec,
    Vec: core_1.Vec,
    validateStructDef,
    vecCompile
};
