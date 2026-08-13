/**
 * Categorie obligatoire Fabio - faille XSS dans l'espace commentaire.
 *
 * Ce fichier verifie le seul point conforme : aucune execution de JavaScript.
 * Le stockage sans echappement et l'interpretation du HTML sont couverts par
 * cypress/anomalies/anomalie-6-xss-avis.cy.js.
 */

const API = Cypress.env('apiUrl');

describe('Fonctionnel - XSS avis', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.setAuthToken();
  });

  it("n'execute pas un script injecte dans un commentaire", () => {
    cy.fixture('reviews').then((reviews) => {
      const titre = `XSS script ${Date.now()}`;

      cy.visit('/#/reviews');
      cy.get('[data-cy="review-form"]').should('be.visible');
      cy.intercept('POST', `${API}/reviews`).as('postReview');
      cy.get('[data-cy="review-input-rating-images"] img').eq(reviews.xssScript.rating - 1).click();
      cy.get('[data-cy="review-input-title"]').type(titre);
      cy.get('[data-cy="review-input-comment"]').type(reviews.xssScript.comment, {
        parseSpecialCharSequences: false,
      });
      cy.get('[data-cy="review-submit"]').click();
      cy.wait('@postReview').its('response.statusCode').should('be.oneOf', [200, 201]);

      cy.contains('[data-cy="review-title"]', titre).should('exist');
      // Le sanitizer Angular retire la balise script du rendu [innerHTML].
      cy.window().its('XSS_EXECUTED').should('be.undefined');
      cy.contains('[data-cy="review-title"]', titre)
        .parents('[data-cy="review-detail"]')
        .find('[data-cy="review-comment"] script')
        .should('not.exist');
    });
  });
});
