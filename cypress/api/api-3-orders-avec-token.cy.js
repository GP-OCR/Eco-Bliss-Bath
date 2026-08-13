/**
 * Requete 3 - GET /orders avec authentification
 * Source : bilan de Marie (liste des produits du panier).
 */
describe('API 3 - GET /orders (avec token)', () => {
  it("retourne le panier de l'utilisateur connecte", () => {
    cy.produitDisponible(1).then((produit) => {
      cy.authRequest('PUT', '/orders/add', {
        body: { product: produit.id, quantity: 1 },
      }).then(() => {
        cy.authRequest('GET', '/orders').then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property('orderLines');
          expect(response.body.orderLines).to.be.an('array');
        });
      });
    });
  });

  after(() => {
    cy.reinitialiserPanier();
  });
});
