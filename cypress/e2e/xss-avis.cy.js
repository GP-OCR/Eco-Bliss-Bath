/**
 * Catégorie obligatoire Fabio — XSS via l'espace commentaire (UI)
 */
describe('Fonctionnel — XSS avis', () => {
  const reviewTitle = `Test XSS E2E ${Date.now()}`;

  beforeEach(() => {
    cy.clearLocalStorage();
    cy.setAuthToken();
  });

  it('stocke une payload XSS via le formulaire d\'avis', () => {
    cy.fixture('reviews').then((reviews) => {
      cy.visit('/#/reviews');
      cy.get('[data-cy="review-form"]').should('be.visible');

      cy.intercept('POST', 'http://localhost:8081/reviews').as('postReview');
      cy.get('[data-cy="review-input-rating-images"] img').eq(4).click();
      cy.get('[data-cy="review-input-title"]').type(reviewTitle);
      cy.get('[data-cy="review-input-comment"]').type(reviews.xss.comment, { parseSpecialCharSequences: false });
      cy.get('[data-cy="review-submit"]').click();
      cy.wait('@postReview').its('response.statusCode').should('be.oneOf', [200, 201]);

      cy.request('GET', 'http://localhost:8081/reviews').then((response) => {
        const review = response.body.find((item) => item.title === reviewTitle);
        expect(review.comment).to.include('<script>');
      });

      cy.contains('[data-cy="review-title"]', reviewTitle).should('exist');
    });
  });
});