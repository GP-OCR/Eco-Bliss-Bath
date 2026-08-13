/**
 * Smoke - pages essentielles et navigation.
 */
describe('Smoke - Pages essentielles', () => {
  it("affiche la page d'accueil avec la navigation complete", () => {
    cy.visit('/#/');
    cy.get('[data-cy="nav-link-home"]').should('be.visible');
    cy.get('[data-cy="nav-link-products"]').should('be.visible');
    cy.get('[data-cy="nav-link-reviews"]').should('be.visible');
    cy.get('[data-cy="nav-link-login"]').should('be.visible');
    cy.get('[data-cy="nav-link-register"]').should('be.visible');
    cy.get('[data-cy="product-home"]').should('have.length.at.least', 1);
  });

  it('affiche la liste des produits', () => {
    cy.visit('/#/products');
    cy.get('[data-cy="product"]').should('have.length.at.least', 1);
    cy.get('[data-cy="product-name"]').first().should('not.be.empty');
    cy.get('[data-cy="product-price"]').first().should('not.be.empty');
  });

  it('affiche la page des avis', () => {
    cy.visit('/#/reviews');
    cy.get('[data-cy="reviews-average"]').should('be.visible');
    cy.get('[data-cy="reviews-number"]').should('be.visible');
  });
});
