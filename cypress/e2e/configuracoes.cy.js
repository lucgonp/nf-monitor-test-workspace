describe('Configurações - Histórico', () => {
  it('limpa histórico com confirmação', () => {
    cy.visit('/');
    cy.openSettings();
    cy.get('[data-testid="btn-limpar-historico"]').should('be.enabled').click();
    cy.contains('Confirma limpar?').should('be.visible');
    cy.contains('Confirmar').click();
    cy.get('[data-testid="historico-execucoes"]')
      .should('be.visible')
      .and('not.contain.text', 'nota_');
  });
});