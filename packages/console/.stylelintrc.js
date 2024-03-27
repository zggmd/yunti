// module.exports = require('@yuntijs/lint').stylelint;
const stylelint = require('@yuntijs/lint').stylelint;

Object.assign(stylelint.rules, {
  'alpha-value-notation': 'number',
  'selector-class-pattern': undefined,
})

stylelint.overrides.push({
  files: ['*.less'],
  rules: {
    'selector-pseudo-class-no-unknown': [true, {
      ignorePseudoClasses: ['global']
    }]
  }
})

module.exports = stylelint;
