module.exports = {
  'env': {
    'browser': true,
    'es2020': true,
  },
  'parser': '@typescript-eslint/parser',
  'parserOptions': {
    'ecmaVersion': 'latest',
  },
  'plugins': [
    '@typescript-eslint',
  ],
  'rules': {
    'no-unused-vars': 0,
    'require-jsdoc': 0,
    'max-len': ['error', { 'code': 130, 'tabWidth': 4 }],
    'semi': ['error', 'never'],
    'quotes': ['error', 'single'],
    'linebreak-style': 0,
    'indent': 0,
    'eqeqeq': 0,
  },
}
