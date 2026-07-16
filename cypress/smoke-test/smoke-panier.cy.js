describe('Smoke — Panier', () => {
  it('redirige vers la connexion sans authentification', () => {
    cy.clearLocalStorage();
    cy.visit('/#/cart');
    cy.url().should('include', '/login');
    cy.get('[data-cy="login-form"]').should('be.visible');
  });

  it('affiche le panier après connexion', () => {
    cy.clearLocalStorage();
    cy.loginUi();
    cy.visit('/#/cart');
    cy.contains('Panier').should('be.visible');
  });
});