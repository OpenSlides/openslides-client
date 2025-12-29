// @ts-check
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import angular from "angular-eslint";
import prettier from "eslint-plugin-prettier/recommended";
import eslintConfigPrettier from "eslint-config-prettier";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";
import stylistic from "@stylistic/eslint-plugin";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";

export default tseslint.config({
    files: ["**/*.ts"],
    extends: [
        eslint.configs.recommended,
        stylistic.configs.customize({
            indent: 4,
            quotes: 'backtick',
            semi: true,
            commaDangle: 'never'
        }),
        ...tseslint.configs.recommended,
        ...tseslint.configs.stylistic,
        ...angular.configs.tsRecommended,
        eslintPluginPrettier,
        eslintConfigPrettier
    ],
    plugins: {
        "@stylistic": stylistic,
        "simple-import-sort": simpleImportSort,
        "unused-imports": unusedImports,
    },
    processor: angular.processInlineTemplates,
    rules: {
        "@angular-eslint/prefer-standalone": ["off"],
        "@angular-eslint/prefer-inject": ["off"],
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

        "@stylistic/arrow-parens": ["error", "as-needed"],

        "@typescript-eslint/no-unused-vars": ["error", {
            argsIgnorePattern: "^_",
            varsIgnorePattern: "^_",
            caughtErrors: "none", // TODO: Remove
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
        "max-len": ["error", {
            code: 120,
            comments: 160,
            ignoreStrings: true,
            ignoreTemplateLiterals: true
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
        "@typescript-eslint/prefer-for-of": ["error"],
        "no-useless-escape": ["error"],
        "no-case-declarations": ["warn"],

        "@typescript-eslint/no-empty-object-type": ["warn"],
        "no-async-promise-executor": ["warn"],
        // TODO: Disable - empty catch should contain at least an description comment
        "no-empty": ["error", { "allowEmptyCatch": true }],

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
        "max-len": ["off"],
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
