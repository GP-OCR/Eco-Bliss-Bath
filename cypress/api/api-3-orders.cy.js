/**
 * Requête API 3/6 — GET /orders avec authentification (Swagger)
 */
describe('API 3 — GET /orders (avec token)', () => {
  it('retourne le panier de l\'utilisateur connecté', () => {
    cy.authRequest('GET', '/orders').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('orderLines');
    });
  });
});