/**
 * Anomalie 6 - faille XSS dans l'espace commentaire (categorie obligatoire).
 *
 * Deux niveaux distincts :
 *  - le back-end stocke le commentaire sans echappement ;
 *  - le front rend le commentaire via [innerHTML], donc le HTML est interprete.
 * L'execution de JavaScript est bloquee par le sanitizer d'Angular : ce point
 * est verifie separement dans cypress/e2e/xss-avis.cy.js.
 */

const API = Cypress.env('apiUrl');

describe('Anomalie 6 - XSS dans les avis', () => {
  it('le back-end ne doit pas stocker de balise HTML brute', () => {
    cy.fixture('reviews').then((reviews) => {
      const titre = `XSS API ${Date.now()}`;

      cy.authRequest('POST', '/reviews', {
        body: { title: titre, comment: reviews.xssScript.comment, rating: reviews.xssScript.rating },
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201]);
      });

      cy.request('GET', `${API}/reviews`).then((response) => {
        const avis = response.body.find((review) => review.title === titre);
        expect(avis, 'avis retrouve dans la liste').to.exist;
        expect(avis.comment, 'commentaire echappe cote back-end').to.not.include('<script>');
      });
    });
  });

  it("le front ne doit pas interpreter le HTML d'un commentaire", () => {
    cy.clearLocalStorage();
    cy.setAuthToken();

    cy.fixture('reviews').then((reviews) => {
      const titre = `XSS HTML ${Date.now()}`;

      cy.visit('/#/reviews');
      cy.get('[data-cy="review-form"]').should('be.visible');
      cy.intercept('POST', `${API}/reviews`).as('postReview');
      cy.get('[data-cy="review-input-rating-images"] img').eq(reviews.xssHtml.rating - 1).click();
      cy.get('[data-cy="review-input-title"]').type(titre);
      cy.get('[data-cy="review-input-comment"]').type(reviews.xssHtml.comment, {
        parseSpecialCharSequences: false,
      });
      cy.get('[data-cy="review-submit"]').click();
      cy.wait('@postReview').its('response.statusCode').should('be.oneOf', [200, 201]);

      cy.contains('[data-cy="review-title"]', titre)
        .parents('[data-cy="review-detail"]')
        .find('[data-cy="review-comment"]')
        .then(($commentaire) => {
          // Attendu : le commentaire est affiche en texte brut.
          expect($commentaire.children().length, 'aucune balise injectee dans le DOM').to.eq(0);
          expect($commentaire.text()).to.eq(reviews.xssHtml.comment);
        });
    });
  });
});
