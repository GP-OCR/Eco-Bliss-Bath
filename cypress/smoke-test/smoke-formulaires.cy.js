/**
 * Smoke - presence des champs et boutons demandes par Marie.
 */
describe('Smoke - Formulaires', () => {
  it('affiche le formulaire de connexion au complet', () => {
    cy.clearLocalStorage();
    cy.visit('/#/login');
    cy.get('[data-cy="login-form"]').should('be.visible');
    cy.get('[data-cy="login-input-username"]').should('be.visible');
    cy.get('[data-cy="login-input-password"]').should('be.visible');
    cy.get('[data-cy="login-submit"]').should('be.visible');
  });

  it("affiche le formulaire d'inscription au complet", () => {
    cy.clearLocalStorage();
    cy.visit('/#/register');
    cy.get('[data-cy="register-form"]').should('be.visible');
    cy.get('[data-cy="register-input-email"]').should('be.visible');
    cy.get('[data-cy="register-input-password"]').should('be.visible');
    cy.get('[data-cy="register-input-password-confirm"]').should('be.visible');
    cy.get('[data-cy="register-submit"]').should('be.visible');
  });

  it("affiche le bouton d'ajout au panier sur une fiche produit apres connexion", () => {
    cy.clearLocalStorage();
    cy.setAuthToken();
    cy.produitDisponible(1).then((produit) => {
      cy.visit(`/#/products/${produit.id}`);
      cy.get('[data-cy="detail-product-form"]').should('be.visible');
      cy.get('[data-cy="detail-product-quantity"]').should('be.visible');
      cy.get('[data-cy="detail-product-add"]').should('be.visible');
    });
  });
});
