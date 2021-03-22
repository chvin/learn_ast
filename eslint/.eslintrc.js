module.exports = {
  root: true,
  parserOptions: { ecmaVersion: 6 },
  plugins: [
   "my-eslint-plugin"
  ],
  rules: {
    "my-eslint-plugin/var-length": "warn" 
  }
};
