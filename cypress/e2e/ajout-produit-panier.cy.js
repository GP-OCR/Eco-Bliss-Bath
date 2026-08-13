/**
 * Scenario fonctionnel 2/2 - Panier
 * Impact financier direct : stock, quantites, commande.
 */

describe('Fonctionnel - Panier', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.reinitialiserPanier();
  });

  it('redirige vers la connexion si le panier est ouvert sans etre connecte', () => {
    cy.visit('/#/cart');
    cy.url().should('include', '/login');
    cy.get('[data-cy="login-form"]').should('be.visible');
  });

  it("ajoute un produit disponible au panier via l'interface", () => {
    cy.setAuthToken();
    cy.produitDisponible(1).then((produit) => {
      cy.visit(`/#/products/${produit.id}`);
      cy.get('[data-cy="detail-product-name"]').should('contain', produit.name);
      cy.get('[data-cy="detail-product-stock"]').should('be.visible');
      cy.get('[data-cy="detail-product-add"]').click();

      cy.url().should('include', '/cart');
      cy.get('[data-cy="cart-line"]').should('have.length.at.least', 1);
      cy.get('[data-cy="cart-line-name"]').should('contain', produit.name);
      cy.get('[data-cy="cart-total"]').should('be.visible');
    });
  });

  it("n'envoie pas de requete pour une quantite negative", () => {
    cy.setAuthToken();
    cy.produitDisponible(1).then((produit) => {
      cy.intercept('PUT', '**/orders/add').as('ajoutPanier');
      cy.visit(`/#/products/${produit.id}`);
      // On attend que le produit soit charge : sinon l'absence de requete
      // pourrait venir d'un clic premature et non de la validation du formulaire.
      cy.get('[data-cy="detail-product-name"]').should('contain', produit.name);
      cy.get('[data-cy="detail-product-quantity"]').clear().type('-1');
      cy.get('[data-cy="detail-product-add"]').click();

      // Le formulaire Angular invalide la saisie : aucun appel ne part.
      // L'assertion porte sur l'absence de requete et non sur l'URL, qui
      // serait vraie avant meme que la navigation ait pu se produire.
      cy.get('[data-cy="detail-product-form"]').should('be.visible');
      cy.get('@ajoutPanier.all').should('have.length', 0);
    });
  });

  it('supprime une ligne du panier', () => {
    cy.setAuthToken();
    cy.produitDisponible(1).then((produit) => {
      cy.intercept('PUT', '**/orders/add').as('ajoutPanier');
      cy.visit(`/#/products/${produit.id}`);
      // On attend que le produit soit charge avant de cliquer, sinon le clic
      // part avant que le formulaire soit pret et aucune requete n'est envoyee.
      cy.get('[data-cy="detail-product-name"]').should('contain', produit.name);
      cy.get('[data-cy="detail-product-stock"]').should('be.visible');
      cy.get('[data-cy="detail-product-add"]').click();
      cy.wait('@ajoutPanier');
      cy.url().should('include', '/cart');
      cy.get('[data-cy="cart-line"]').should('have.length.at.least', 1);

      cy.get('[data-cy="cart-line-delete"]').first().click();
      cy.get('[data-cy="cart-empty"]').should('be.visible');
    });
  });

  after(() => {
    cy.reinitialiserPanier();
  });
});
