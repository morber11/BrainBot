const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
    {
        ignores: [
            'coverage/',
            'dist/',
            'build/',
            'src/utils/what-i-am-about-to-do-has-not-been-approved-by-the-vatican/',
        ],
    },
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'commonjs',
            globals: {
                ...globals.node,
                ...globals.mocha,
                expect: 'readonly',
                sinon: 'readonly',
                proxyquire: 'readonly',
            },
        },
        rules: {
            'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_', caughtErrors: 'none' }],
            'prefer-const': 'error',
            eqeqeq: ['error', 'smart'],
        },
    },
    {
        files: ['src/utils/logger.js'],
        rules: {
            'no-console': 'off',
        },
    },
];
