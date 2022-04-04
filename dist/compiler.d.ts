import { StructDef } from "./core";
export declare const ERR_PREFIX = "[VecGenerator]";
declare type StructDefToken = {
    elementSize: number;
    fieldNames: string[];
    numberFields: {
        field: string;
        offset: number;
    }[];
    booleanFields: {
        field: string;
        offset: number;
        byteOffset: number;
    }[];
    charFields: {
        field: string;
        offset: number;
    }[];
};
export declare function tokenizeStructDef(def: any): StructDefToken;
export declare function validateCompileOptions(input: any): void;
declare type DefOptions = {
    lang: "js" | "ts";
    pathToLib: string;
    className: string;
    exportSyntax: "none" | "named" | "default";
    runtimeCompile: boolean;
};
export declare function createVecDef(tokens: StructDefToken, structDef: StructDef, { lang, pathToLib, className, exportSyntax, runtimeCompile }: DefOptions): {
    def: string;
    className: string;
};
export {};
//# sourceMappingURL=compiler.d.ts.map