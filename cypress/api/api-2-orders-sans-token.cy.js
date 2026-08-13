/**
 * Requete 2 - GET /orders sans authentification
 * Source : bilan de Marie (donnees confidentielles avant connexion).
 *
 * Marie attendait 403 et a consigne le 401 comme une anomalie.
 * Le 401 est la reponse correcte : l'utilisateur n'est pas authentifie.
 * Le 403 designe un utilisateur authentifie sans les droits necessaires.
 * Ce test asserte donc 401 : l'anomalie remontee par Marie est un faux positif.
 */

const API = Cypress.env('apiUrl');

describe('API 2 - GET /orders (sans token)', () => {
  it("refuse l'acces au panier avec un code 401", () => {
    cy.request({
      method: 'GET',
      url: `${API}/orders`,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });
});
