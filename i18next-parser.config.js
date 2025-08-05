module.exports = {
  locales: ['en', 'fr', 'es'],
  input: ['src/**/*.{ts,tsx}'],
  output: 'src/locales/$LOCALE/translation.json',
  defaultNamespace: 'translation',
  createOldCatalogs: false,
  keepRemoved: false,
  sort: true,
};
