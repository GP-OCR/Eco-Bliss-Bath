describe('Smoke tests - Pages essentielles', () => {
  it('affiche la page d\'accueil avec la navigation', () => {
    cy.visit('/#/');
    cy.get('[data-cy="nav-link-home"]').should('be.visible');
    cy.get('[data-cy="nav-link-products"]').should('be.visible');
    cy.get('[data-cy="nav-link-reviews"]').should('be.visible');
    cy.get('[data-cy="nav-link-login"]').should('be.visible');
    cy.get('[data-cy="nav-link-register"]').should('be.visible');
  });

  it('affiche la liste des produits', () => {
    cy.visit('/#/products');
    cy.get('[data-cy="product"]').should('have.length.at.least', 1);
  });

  it('affiche le formulaire de connexion', () => {
    cy.visit('/#/login');
    cy.get('[data-cy="login-form"]').should('be.visible');
    cy.get('[data-cy="login-input-username"]').should('be.visible');
    cy.get('[data-cy="login-input-password"]').should('be.visible');
    cy.get('[data-cy="login-submit"]').should('be.visible');
  });
});