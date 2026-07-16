/**
 * Requête API 6/6 — PUT /orders/add produit en rupture (Swagger)
 * Variante métier : vérifie l'anomalie stock ≤ 0 acceptée par l'API.
 */
describe('API 6 — PUT /orders/add (produit en rupture)', () => {
  it('accepte l\'ajout d\'un produit à stock nul ou négatif (anomalie)', () => {
    cy.fixture('products').then((products) => {
      cy.request('GET', `http://localhost:8081/products/${products.outOfStock.id}`).then((productRes) => {
        expect(productRes.body.availableStock).to.be.at.most(0);
      });

      cy.authRequest('PUT', '/orders/add', {
        body: {
          product: products.outOfStock.id,
          quantity: products.outOfStock.quantity,
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });
  });
});