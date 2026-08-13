/**
 * Controle demande par Marie : le stock affiche doit refleter la quantite
 * placee dans le panier.
 */

const API = Cypress.env('apiUrl');

describe('Fonctionnel - Coherence du stock apres ajout', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.reinitialiserPanier();
  });

  it('decremente le stock du produit ajoute au panier', () => {
    cy.setAuthToken();
    cy.produitDisponible(3).then((produit) => {
      const stockInitial = produit.availableStock;

      cy.intercept('PUT', '**/orders/add').as('ajoutPanier');
      cy.visit(`/#/products/${produit.id}`);
      // On attend que le produit soit charge avant de modifier la quantite et
      // de cliquer, sinon le clic part avant que le formulaire soit pret et
      // aucune requete n'est envoyee.
      cy.get('[data-cy="detail-product-name"]').should('be.visible');
      cy.get('[data-cy="detail-product-stock"]').should('be.visible');
      cy.get('[data-cy="detail-product-quantity"]').clear().type('2');
      cy.get('[data-cy="detail-product-add"]').click();
      cy.wait('@ajoutPanier');
      cy.url().should('include', '/cart');

      cy.request('GET', `${API}/products/${produit.id}`).then((response) => {
        expect(response.body.availableStock, 'stock decremente de la quantite ajoutee')
          .to.eq(stockInitial - 2);
      });
    });
  });

  after(() => {
    cy.reinitialiserPanier();
  });
});
