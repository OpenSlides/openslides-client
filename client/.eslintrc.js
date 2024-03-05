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
                'plugin:rxjs/recommended',
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

                'jsdoc/require-example': ['off'],
                'jsdoc/newline-after-description': ['off'],
                'jsdoc/no-types': ['off'],
                '@typescript-eslint/no-empty-function': ['off'],
                '@typescript-eslint/no-empty-interface': ['off'],
                'rxjs/no-async-subscribe': ['off'],

                // Should be switched to error ordered by priority
                '@typescript-eslint/ban-ts-comment': ['warn'],
                '@typescript-eslint/no-explicit-any': ['off'],
                '@typescript-eslint/no-non-null-assertion': ['off'],
                'no-console': ['off', { allow: ['warn', 'error', 'info', 'debug'] }]
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
            extends: [
                'plugin:@angular-eslint/template/recommended',
                'plugin:@angular-eslint/template/accessibility'
            ],
            rules: {
                // Should be switched to error
                '@angular-eslint/template/click-events-have-key-events': ['warn'],
                '@angular-eslint/template/interactive-supports-focus': ['warn'],
                '@angular-eslint/template/elements-content': ['warn'],
                '@angular-eslint/template/alt-text': ['warn']
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
