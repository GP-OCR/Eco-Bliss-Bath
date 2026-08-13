/**
 * Requete 4 - GET /products/{id}
 * Source : bilan de Marie (fiche produit specifique).
 */

const API = Cypress.env('apiUrl');

describe('API 4 - GET /products/{id}', () => {
  it("retourne les details d'un produit existant", () => {
    cy.produitDisponible(1).then((produit) => {
      cy.request('GET', `${API}/products/${produit.id}`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.include({ id: produit.id, name: produit.name });
        expect(response.body).to.have.property('availableStock');
        expect(response.body).to.have.property('price');
      });
    });
  });
});
