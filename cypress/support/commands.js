// Exemplo de comandos reutilizáveis
Cypress.Commands.add('openSettings', () => {
  cy.contains('Configurações').should('be.visible').click();
});