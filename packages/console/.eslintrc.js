// module.exports = require('@yuntijs/lint').eslint;

const eslint = require('@yuntijs/lint').eslint;

Object.assign(eslint.rules, {
  'unicorn/prefer-query-selector': 'warn',
  'unicorn/prefer-dom-node-append': 'warn',
  'unicorn/prefer-dom-node-remove': 'warn',
  'unicorn/prefer-add-event-listener': 'warn',
  'unicorn/no-useless-promise-resolve-reject': 'warn',
  'unicorn/no-useless-switch-case': 'warn',
  'unicorn/prefer-set-has': 'warn',
  'unicorn/prefer-string-slice': 'warn',
  'unicorn/prefer-includes': 'warn',
  'unicorn/escape-case': 'warn',
  'array-callback-return': 'warn',
  'guard-for-in': 'warn',
  'import/newline-after-import': 'warn',
  'import/no-duplicates': 'warn',
  'react/no-unescaped-entities': 'warn',
  'react/no-unknown-property': 'warn',
})

module.exports = eslint;
