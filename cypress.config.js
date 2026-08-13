const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    specPattern: 'cypress/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    env: {
      // Surchargeable : CYPRESS_apiUrl=http://autre-hote:8081 npm test
      apiUrl: 'http://localhost:8081',
    },
    // Chaque spec produit son propre JSON : ils sont ensuite fusionnes en un
    // rapport unique (npm test). Sans cela, mochawesome ecrase le fichier a
    // chaque spec et le rapport ne contient que la derniere.
    reporter: 'mochawesome',
    reporterOptions: {
      reportDir: 'cypress/reports/json',
      overwrite: false,
      html: false,
      json: true,
    },
  },
});
