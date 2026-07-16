/**
 * Requête API 2/6 — GET /orders sans authentification (Swagger)
 */
describe('API 2 — GET /orders (sans token)', () => {
  it('refuse l\'accès au panier sans token', () => {
    cy.request({
      method: 'GET',
      url: 'http://localhost:8081/orders',
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });
});