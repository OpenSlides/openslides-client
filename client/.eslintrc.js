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
                'plugin:@typescript-eslint/recommended',
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
                '@typescript-eslint/quotes': ['error', 'backtick', { 'avoidEscape': false }],
                '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_', 'varsIgnorePattern': '^_' }],
                'simple-import-sort/imports': 'error',
                'simple-import-sort/exports': 'error',
                'unused-imports/no-unused-imports': 'error',
                'no-restricted-properties': ['error', {
                    'property': 'asObservable',
                    'message': 'Please use a typecast or explicitly instantiate a new Observable.'
                }],
                'lines-between-class-members': ['error', 'always', { 'exceptAfterSingleLine': true }],
                '@typescript-eslint/no-unnecessary-type-constraint': ['error'],
                '@typescript-eslint/no-this-alias': ['error'],
                '@typescript-eslint/adjacent-overload-signatures': ['error'],
                '@typescript-eslint/ban-types': ['error'],
                '@typescript-eslint/explicit-member-accessibility': ['error'],
                '@typescript-eslint/explicit-function-return-type': ['error'],
                '@typescript-eslint/ban-ts-comment': ['error'],

                'jsdoc/require-example': ['off'],
                'jsdoc/newline-after-description': ['off'],
                'jsdoc/no-types': ['off'],
                '@typescript-eslint/no-empty-function': ['off'],
                '@typescript-eslint/no-empty-interface': ['off'],

                // Should be switched to error ordered by priority
                '@typescript-eslint/no-explicit-any': ['off'],
                '@typescript-eslint/no-non-null-assertion': ['off'],
                'no-console': ['off', { allow: ['warn', 'error', 'info', 'debug'] }],

                // Currently used by view models
                '@typescript-eslint/no-unsafe-declaration-merging': ['off']
            }
        },
        {
            files: ['*.spec.ts'],
            rules: {
                'no-restricted-globals': ['error', 'fdescribe', 'fit'],
                '@typescript-eslint/explicit-member-accessibility': ['off'],
                '@typescript-eslint/explicit-function-return-type': ['off'],
            }
        },
        {
            files: ['*.html'],
            extends: [
                'plugin:@angular-eslint/template/recommended',
                'plugin:@angular-eslint/template/accessibility'
            ],
            rules: {
                '@angular-eslint/template/attributes-order': ['error', {
                    alphabetical: true
                }],
                '@angular-eslint/template/prefer-control-flow': ['error'],
                // Should be switched to error
                '@angular-eslint/template/elements-content': ['warn']
            }
        },
        {
            files: ['*.html'],
            excludedFiles: ['*inline-template-*.component.html'],
            extends: ['plugin:prettier/recommended'],
            rules: {
                'prettier/prettier': ['error', { 'parser': 'angular' }]
            }
        }
    ]
};
