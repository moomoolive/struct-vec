/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
export default {
    preset: "ts-jest/presets/js-with-ts-esm",
    globals: {
        'ts-jest': {useESM: true},
    },
    moduleNameMapper: {'^(\\.{1,2}/.*)\\.js$': '$1',},
    testEnvironment: "jsdom",
    verbose: true,
    modulePathIgnorePatterns: ["<rooDir>/node_modules", "<rootDir>/dist"]
}
