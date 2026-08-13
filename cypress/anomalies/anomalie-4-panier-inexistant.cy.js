/**
 * Anomalie 4 - un panier jamais initialise remonte une erreur au lieu d'une liste vide.
 */

const API = Cypress.env('apiUrl');

describe('Anomalie 4 - panier inexistant', () => {
  it('doit retourner 200 et un panier vide pour un nouvel utilisateur', () => {
    cy.creerUtilisateur().then((loginResponse) => {
      expect(loginResponse.status).to.eq(200);

      cy.request({
        method: 'GET',
        url: `${API}/orders`,
        headers: { Authorization: `Bearer ${loginResponse.body.token}` },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status, 'panier vide et non erreur').to.eq(200);
        expect(response.body.orderLines).to.be.an('array').and.to.be.empty;
      });
    });
  });
});
