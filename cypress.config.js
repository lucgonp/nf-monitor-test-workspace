module.exports = {
  e2e: {
    baseUrl: 'http://localhost:5173',
    defaultCommandTimeout: 10000,
    viewportWidth: 1366,
    viewportHeight: 768,
    setupNodeEvents(on, config) { return config; }
  }
};