/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution")

module.exports = {
  root: true,
  "extends": [
    "plugin:vue/vue3-essential",
    "eslint:recommended",
    "@vue/eslint-config-typescript",
    "@vue/eslint-config-prettier/skip-formatting"
  ],
  parserOptions: {
    ecmaVersion: "latest"
  },
  rules: {
    "import/extensions": "off",
    "import/no-unresolved": "off",
    "quotes": ["warn", "single"],
    "semi": ["off", "never"],
    "max-len": "off",
    "linebreak-style": "off",
    "camelcase": ["off", { "properties": "never", "ignoreDestructuring": true, "ignoreImports": true }],
    "arrow-parens": ["off", "as-needed"],
    "vue/multiline-html-element-content-newline": "warn",
    "vue/component-tags-order": ["warn", {
      "order": [ [ "template", "script" ], "style" ]
    }],
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "import/prefer-default-export": "off",
    "default-case": "off",
    "@typescript-eslint/no-explicit-any": 1,
    "@typescript-eslint/no-this-alias": "off",
    "@typescript-eslint/camelcase": "off",
    "@typescript-eslint/no-var-requires": "off",
    "@typescript-eslint/no-use-before-define": "off",
    "@typescript-eslint/consistent-type-assertions": "off",
    "@typescript-eslint/no-unused-vars": 1,
    "no-param-reassign": "off",
    "no-prototype-builtins": "off",
    "no-lone-blocks": "off",
    "no-restricted-globals": "off",
    "no-useless-constructor": "off",
    "class-methods-use-this": "off",
    "prettier/prettier": "warn",
    "no-console": "warn"
  }
}
