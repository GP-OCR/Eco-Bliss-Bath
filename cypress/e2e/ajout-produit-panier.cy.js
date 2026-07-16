/**
 * Scénario fonctionnel 2/2 — Gestion du panier (recommandation partie I)
 */
describe('Fonctionnel — Panier', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.setAuthToken();
  });

  it('ajoute un produit disponible au panier via l\'interface', () => {
    cy.fixture('products').then((products) => {
      cy.visit(`/#/products/${products.inStock.id}`);
      cy.get('[data-cy="detail-product-name"]').should('contain', products.inStock.name);
      cy.get('[data-cy="detail-product-add"]').click();

      cy.url().should('include', '/cart');
      cy.get('[data-cy="cart-line"]').should('have.length.at.least', 1);
      cy.get('[data-cy="cart-line-name"]').should('contain', products.inStock.name);
    });
  });

  it('accepte l\'ajout d\'un produit en rupture via l\'API (anomalie)', () => {
    cy.fixture('products').then((products) => {
      cy.request('GET', `http://localhost:8081/products/${products.outOfStock.id}`).then((productRes) => {
        expect(productRes.body.availableStock).to.be.at.most(0);
      });

      cy.window().then((win) => {
        cy.request({
          method: 'PUT',
          url: 'http://localhost:8081/orders/add',
          headers: { Authorization: `Bearer ${win.localStorage.getItem('user')}` },
          body: { product: products.outOfStock.id, quantity: products.outOfStock.quantity },
        }).then((response) => {
          expect(response.status).to.eq(200);
          const line = response.body.orderLines.find((l) => l.product.id === products.outOfStock.id);
          expect(line).to.exist;
        });
      });
    });
  });
});