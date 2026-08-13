/**
 * Requete 6 - POST /reviews
 * Source : bilan de Marie (ajouter un avis).
 */

const API = Cypress.env('apiUrl');

describe('API 6 - POST /reviews', () => {
  it('publie un avis avec authentification', () => {
    cy.fixture('reviews').then((reviews) => {
      const titre = `${reviews.valid.title} ${Date.now()}`;
      cy.authRequest('POST', '/reviews', {
        body: { title: titre, comment: reviews.valid.comment, rating: reviews.valid.rating },
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201]);
      });

      cy.request('GET', `${API}/reviews`).then((response) => {
        expect(response.body.some((avis) => avis.title === titre)).to.be.true;
      });
    });
  });
});
