module.exports = {
  "extends": "@take-two-t2gp/eslint-config-t2gp/lib/eslintrc-base",
  "rules": {
    "no-plusplus": "off",
    "no-underscore-dangle": "off",
    "no-use-before-define": ["error", { "functions": false }]
  }
};
