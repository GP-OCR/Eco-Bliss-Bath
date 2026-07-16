/**
 * Catégorie obligatoire Fabio — Faille XSS sur POST /reviews (Swagger)
 */
describe('API — POST /reviews (XSS)', () => {
  it('accepte une payload XSS dans le commentaire (faille potentielle)', () => {
    cy.fixture('reviews').then((reviews) => {
      cy.authRequest('POST', '/reviews', { body: reviews.xss }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201]);
      });

      cy.request('GET', 'http://localhost:8081/reviews').then((response) => {
        const xssReview = response.body.find((review) => review.comment.includes('script'));
        expect(xssReview).to.exist;
        expect(xssReview.comment).to.include('<script>');
      });
    });
  });
});