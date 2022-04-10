module.exports = {
    'root': true,
    'parser': '@typescript-eslint/parser',
    'env': {
        'browser': true,
        'es6': true,
        'node': true,
        'jest': true,
        'cypress/globals': true

    },
    'plugins': [
        '@typescript-eslint',
        'import',
        'cypress'
    ],
    'extends': [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended'
    ],
    'globals': {
        'Atomics': 'readonly',
        'SharedArrayBuffer': 'readonly'
    },
    'parserOptions': {
        'ecmaVersion': 2018,
        'sourceType': 'module',
    },
    'rules': {
        'no-console': 1,
        'comma-dangle': 'off',
        'react/jsx-filename-extension': 'off',
        'import/prefer-default-export': 'off',
        'import/no-default-export': 'warn',
        'no-mixed-spaces-and-tabs': 0,
        'indent': ['error', 4, { 'SwitchCase': 1 }],
        'quotes': ['error', 'single'],
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-unused-vars': [1, { 'argsIgnorePattern': '^_' }]
    }
};
