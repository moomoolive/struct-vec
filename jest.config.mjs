/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
export default {
    preset: "ts-jest",
    testEnvironment: "jsdom",
    verbose: true,
    modulePathIgnorePatterns: ["<rooDir>/node_modules", "<rootDir>/dist"]
}
