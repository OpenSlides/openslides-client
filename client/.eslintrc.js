module.exports = {
    root: true,
    ignorePatterns: ['projects/**/*'],
    overrides: [
        {
            files: ['*.ts'],
            parser: '@typescript-eslint/parser',
            parserOptions: {
                project: ['./tsconfig.json'],
                tsconfigRootDir: __dirname,
                sourceType: 'module',
                createDefaultProgram: true
            },
            plugins: ['simple-import-sort', 'unused-imports'],
            extends: [
                'plugin:@angular-eslint/recommended',
                'plugin:@angular-eslint/template/process-inline-templates',
                'plugin:prettier/recommended'
            ],
            rules: {
                '@angular-eslint/component-selector': [
                    'error',
                    {
                        type: 'element',
                        prefix: 'os',
                        style: 'kebab-case'
                    }
                ],
                '@angular-eslint/directive-selector': [
                    'error',
                    {
                        type: 'attribute',
                        prefix: 'os',
                        style: 'camelCase'
                    }
                ],
                '@angular-eslint/no-conflicting-lifecycle': ['off'],
                '@angular-eslint/no-output-native': ['off'],
                '@typescript-eslint/adjacent-overload-signatures': ['off'],
                '@typescript-eslint/ban-types': ['off'],
                '@typescript-eslint/consistent-type-assertions': ['off'],
                '@typescript-eslint/member-ordering': ['off'],
                '@typescript-eslint/naming-convention': [
                    'error',
                    {
                        'selector': 'variable',
                        'format': ['camelCase', 'PascalCase', 'UPPER_CASE', 'snake_case'],
                        'leadingUnderscore': 'allow'
                    },
                    {
                        'selector': 'typeProperty',
                        'format': ['camelCase', 'PascalCase', 'UPPER_CASE', 'snake_case']
                    },
                    {
                        'selector': 'enumMember',
                        'format': ['camelCase', 'PascalCase', 'snake_case', 'UPPER_CASE']
                    }
                ],
                '@typescript-eslint/no-empty-interface': ['off'],
                '@typescript-eslint/no-namespace': ['off'],
                '@typescript-eslint/no-unused-vars': 'off',
                '@typescript-eslint/prefer-for-of': ['off'],
                '@typescript-eslint/quotes': ['error', 'backtick', { 'avoidEscape': false }],
                'arrow-body-style': ['off'],
                'id-blacklist': ['off'],
                'jsdoc/require-example': ['off'],
                'jsdoc/newline-after-description': ['off'],
                'jsdoc/no-types': ['off'],
                'max-len': ['off'],
                'no-bitwise': ['off'],
                'no-console': ['off'],
                'no-underscore-dangle': ['off'],
                'object-shorthand': ['off'],
                'prefer-arrow/prefer-arrow-functions': ['off'],
                'simple-import-sort/imports': 'error',
                'simple-import-sort/exports': 'error',
                'unused-imports/no-unused-imports': 'error',
                'no-restricted-properties': ['error', {
                    'property': 'asObservable',
                    'message': 'Please use a typecast or explicitly instantiate a new Observable.'
                }]
            }
        },
        {
            files: ['*.spec.ts'],
            rules: {
                'no-restricted-globals': ['error', 'fdescribe', 'fit'],
            }
        },
        {
            files: ['*.html'],
            extends: ['plugin:@angular-eslint/template/recommended'],
            rules: {}
        },
        {
            files: ['*.html'],
            excludedFiles: ['*inline-template-*.component.html'],
            extends: ['plugin:prettier/recommended'],
            rules: {
                "prettier/prettier": ["error", { "parser": "angular" }]
            }
        }
    ]
};
