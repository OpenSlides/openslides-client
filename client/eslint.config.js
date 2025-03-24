// @ts-check
const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");
const prettier = require("eslint-plugin-prettier/recommended");
const simpleImportSort = require("eslint-plugin-simple-import-sort");
const unusedImports = require("eslint-plugin-unused-imports");

module.exports = tseslint.config({
    files: ["**/*.ts"],
    extends: [
        eslint.configs.recommended,
        ...tseslint.configs.recommended,
        ...tseslint.configs.stylistic,
        ...angular.configs.tsRecommended,
    ],
    plugins: {
        "simple-import-sort": simpleImportSort,
        "unused-imports": unusedImports,
    },
    processor: angular.processInlineTemplates,
    rules: {
        "@angular-eslint/prefer-standalone": ["off"],
        "@angular-eslint/component-selector": ["error", {
            type: "element",
            prefix: "os",
            style: "kebab-case",
        }],

        "@angular-eslint/directive-selector": ["error", {
            type: "attribute",
            prefix: "os",
            style: "camelCase",
        }],

        "@typescript-eslint/naming-convention": ["error", {
            selector: "variable",
            format: ["camelCase", "PascalCase", "UPPER_CASE", "snake_case"],
            leadingUnderscore: "allow",
        }, {
            selector: "typeProperty",
            format: ["camelCase", "PascalCase", "UPPER_CASE", "snake_case"],
        }, {
            selector: "enumMember",
            format: ["camelCase", "PascalCase", "snake_case", "UPPER_CASE"],
        }],

        // "@stylistic/ts/quotes": ["error", "backtick", {
            // avoidEscape: false,
        // }],

        "@typescript-eslint/no-unused-vars": ["error", {
            argsIgnorePattern: "^_",
            varsIgnorePattern: "^_",
            caughtErrorsIgnorePattern: "^_",
            destructuredArrayIgnorePattern: "^_",
        }],

        "simple-import-sort/imports": "error",
        "simple-import-sort/exports": "error",
        "unused-imports/no-unused-imports": "error",

        "no-restricted-properties": ["error", {
            property: "asObservable",
            message: "Please use a typecast or explicitly instantiate a new Observable.",
        }],

        "lines-between-class-members": ["error", "always", {
            exceptAfterSingleLine: true,
        }],

        "no-debugger": ["error"],
        "@typescript-eslint/no-unnecessary-type-constraint": ["error"],
        "@typescript-eslint/no-this-alias": ["error"],
        "@typescript-eslint/no-unsafe-function-type": ["error"],
        "@typescript-eslint/no-wrapper-object-types": ["error"],
        "@typescript-eslint/adjacent-overload-signatures": ["error"],
        "@typescript-eslint/explicit-member-accessibility": ["error"],
        "@typescript-eslint/explicit-function-return-type": ["error"],
        "@typescript-eslint/ban-ts-comment": ["error"],
        "jsdoc/require-example": ["off"],
        "jsdoc/newline-after-description": ["off"],
        "jsdoc/no-types": ["off"],
        "@typescript-eslint/no-empty-function": ["off"],
        "@typescript-eslint/no-empty-interface": ["off"],
        "@typescript-eslint/no-explicit-any": ["off"],
        "@typescript-eslint/no-non-null-assertion": ["off"],

        "no-console": ["off", {
            allow: ["warn", "error", "info", "debug"],
        }],

        "@typescript-eslint/no-unsafe-declaration-merging": ["off"],
    },
}, {
    files: ["**/*.spec.ts"],

    rules: {
        "no-restricted-globals": ["error", "fdescribe", "fit"],
        "@typescript-eslint/explicit-member-accessibility": ["off"],
        "@typescript-eslint/explicit-function-return-type": ["off"],
    },
}, {
    files: ["**/*.html"],
    extends: [
        ...angular.configs.templateRecommended,
        ...angular.configs.templateAccessibility,
    ],
    rules: {
        "@angular-eslint/template/attributes-order": ["error", {
            alphabetical: true,
        }],

        "@angular-eslint/template/prefer-control-flow": ["error"],
    },
}, {
    files: ["**/*.html"],
    ignores: ["**/*inline-template-*.component.html"],
    extends: [
        prettier
    ],

    rules: {
        "prettier/prettier": ["error", {
            parser: "angular",
        }],
    },
});
