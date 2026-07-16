/**
 * Requête API complémentaire — POST /reviews (Swagger)
 * Catégorie obligatoire Fabio : tests API avis.
 */
describe('API — POST /reviews', () => {
  it('publie un avis avec authentification', () => {
    cy.fixture('reviews').then((reviews) => {
      cy.authRequest('POST', '/reviews', { body: reviews.valid }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201]);
      });
    });
  });
});