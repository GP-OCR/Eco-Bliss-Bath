/**
 * Anomalie 2 - le back-end accepte des quantites qui ne correspondent a aucun achat.
 * Reprend les cas limites demandes par Marie (quantite nulle, quantite negative).
 */
describe('Anomalie 2 - quantites invalides', () => {
  beforeEach(() => {
    cy.reinitialiserPanier();
  });

  it('doit refuser une quantite egale a zero', () => {
    cy.produitDisponible(1).then((produit) => {
      cy.authRequest('PUT', '/orders/add', {
        body: { product: produit.id, quantity: 0 },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status, 'refus attendu (4xx)').to.be.within(400, 499);
      });
    });
  });

  it('doit refuser une quantite negative', () => {
    cy.produitDisponible(1).then((produit) => {
      cy.authRequest('PUT', '/orders/add', {
        body: { product: produit.id, quantity: -1 },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status, 'refus attendu (4xx)').to.be.within(400, 499);
      });
    });
  });

  after(() => {
    cy.reinitialiserPanier();
  });
});
