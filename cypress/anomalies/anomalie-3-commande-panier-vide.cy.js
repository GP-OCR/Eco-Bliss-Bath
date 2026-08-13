/**
 * Anomalie 3 - une commande est validee alors que le panier ne contient aucun article.
 */

const API = Cypress.env('apiUrl');

describe('Anomalie 3 - commande avec panier vide', () => {
  it('doit refuser la validation d\'une commande sans article', () => {
    cy.produitDisponible(1).then((produit) => {
      cy.creerUtilisateur().then((loginResponse) => {
        expect(loginResponse.status).to.eq(200);
        const token = loginResponse.body.token;

        // Un panier est cree puis vide : il existe mais ne contient rien.
        cy.request({
          method: 'PUT',
          url: `${API}/orders/add`,
          headers: { Authorization: `Bearer ${token}` },
          body: { product: produit.id, quantity: 1 },
        });

        cy.viderPanier(token).then(() => {
          cy.request({
            method: 'POST',
            url: `${API}/orders`,
            headers: { Authorization: `Bearer ${token}` },
            failOnStatusCode: false,
            body: {
              firstname: 'Qa',
              lastname: 'Test',
              address: '1 rue des Tests',
              zipCode: '75000',
              city: 'Paris',
            },
          }).then((response) => {
            expect(response.status, 'refus attendu (4xx)').to.be.within(400, 499);
          });
        });
      });
    });
  });
});
