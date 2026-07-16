/**
 * Requête API 5/6 — PUT /orders/add produit en stock (Swagger)
 */
describe('API 5 — PUT /orders/add (produit disponible)', () => {
  it('ajoute un produit en stock au panier', () => {
    cy.fixture('products').then((products) => {
      cy.authRequest('PUT', '/orders/add', {
        body: {
          product: products.inStock.id,
          quantity: products.inStock.quantity,
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.orderLines).to.be.an('array');
      });
    });
  });
});