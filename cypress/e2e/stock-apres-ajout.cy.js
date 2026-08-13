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

      cy.visit(`/#/products/${produit.id}`);
      cy.get('[data-cy="detail-product-quantity"]').clear().type('2');
      cy.get('[data-cy="detail-product-add"]').click();
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
