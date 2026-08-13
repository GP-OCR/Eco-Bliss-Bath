/**
 * Requete 5 - PUT /orders/add avec un produit disponible
 * Source : bilan de Marie (ajouter un produit disponible au panier).
 *
 * Marie signale que la creation d'une ligne de panier devrait etre un POST.
 * Le contrat Swagger expose un PUT : ecart de conception REST, non bloquant,
 * repris dans le bilan sans test dedie (aucune regle metier en jeu).
 */
describe('API 5 - PUT /orders/add (produit disponible)', () => {
  beforeEach(() => {
    cy.reinitialiserPanier();
  });

  it('ajoute un produit en stock au panier', () => {
    cy.produitDisponible(2).then((produit) => {
      cy.authRequest('PUT', '/orders/add', {
        body: { product: produit.id, quantity: 2 },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.orderLines).to.be.an('array').and.not.be.empty;
        const ligne = response.body.orderLines.find((l) => l.product.id === produit.id);
        expect(ligne, 'ligne de panier creee').to.exist;
        expect(ligne.quantity).to.eq(2);
      });
    });
  });

  after(() => {
    cy.reinitialiserPanier();
  });
});
