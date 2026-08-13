/**
 * Anomalie 5 - le catalogue expose des produits dont le stock est negatif.
 * Consequence directe de l'absence de controle a l'ajout au panier (anomalie 1).
 */

const API = Cypress.env('apiUrl');

describe('Anomalie 5 - stock negatif au catalogue', () => {
  it('ne doit exposer aucun produit avec un stock inferieur a zero', () => {
    cy.request('GET', `${API}/products`).then((response) => {
      expect(response.status).to.eq(200);
      const negatifs = response.body.filter((produit) => produit.availableStock < 0);
      expect(negatifs.map((p) => `${p.id} - ${p.name}`), 'produits a stock negatif').to.be.empty;
    });
  });
});
