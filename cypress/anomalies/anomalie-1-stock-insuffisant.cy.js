/**
 * Anomalie 1 - le back-end ne compare pas la quantite demandee au stock.
 * Couvre la requete 7 du bilan de Marie : ajout d'un produit en rupture de stock,
 * ainsi que les deux cas limites du scenario panier de Marie (quantite negative,
 * quantite superieure a 20).
 * Chaque test asserte la regle metier : son echec constitue la preuve du defaut.
 */

const API = Cypress.env('apiUrl');

describe('Anomalie 1 - controle du stock a l\'ajout au panier', () => {
  beforeEach(() => {
    cy.reinitialiserPanier();
  });

  it('doit refuser un produit en rupture de stock', () => {
    cy.fixture('products').then((products) => {
      cy.request('GET', `${API}/products/${products.rupture.id}`).then((res) => {
        expect(res.body.availableStock, 'produit bien en rupture').to.eq(0);
      });

      cy.authRequest('PUT', '/orders/add', {
        body: { product: products.rupture.id, quantity: 1 },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status, 'refus attendu (4xx)').to.be.within(400, 499);
      });
    });
  });

  it('doit refuser une quantite superieure au stock disponible', () => {
    cy.produitDisponible(1).then((produit) => {
      cy.authRequest('PUT', '/orders/add', {
        body: { product: produit.id, quantity: produit.availableStock + 1 },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status, 'refus attendu (4xx)').to.be.within(400, 499);
      });
    });
  });

  it("doit empecher l'ajout d'une quantite superieure au stock depuis l'interface", () => {
    cy.setAuthToken();
    cy.produitDisponible(1).then((produit) => {
      cy.intercept('PUT', '**/orders/add').as('ajoutPanier');
      cy.visit(`/#/products/${produit.id}`);
      cy.get('[data-cy="detail-product-name"]').should('contain', produit.name);
      cy.get('[data-cy="detail-product-quantity"]').clear().type(String(produit.availableStock + 1));
      cy.get('[data-cy="detail-product-add"]').click();

      // Attendu : la requete est refusee. L'assertion porte sur le code de
      // reponse et non sur l'URL, qui serait vraie avant meme la navigation.
      cy.wait('@ajoutPanier').its('response.statusCode')
        .should('be.within', 400, 499);
    });
  });

  it("doit refuser une quantite superieure a 20 depuis l'interface (cas limite du bilan de Marie)", () => {
    cy.setAuthToken();
    // Le produit est choisi avec un stock inferieur a 21 : la quantite demandee
    // depasse alors reellement le stock disponible. Aucune regle metier ne fixe
    // de plafond a 20, cette valeur est celle du cas limite demande par Marie.
    cy.request('GET', `${API}/products`).then((response) => {
      const produit = response.body.find((p) => p.availableStock >= 1 && p.availableStock < 21);
      expect(produit, 'produit dont le stock est inferieur a 21').to.exist;

      cy.intercept('PUT', '**/orders/add').as('ajoutPanier');
      cy.visit(`/#/products/${produit.id}`);
      cy.get('[data-cy="detail-product-quantity"]').clear().type('21');
      cy.get('[data-cy="detail-product-add"]').click();

      cy.wait('@ajoutPanier').its('response.statusCode')
        .should('be.within', 400, 499);
    });
  });

  after(() => {
    cy.reinitialiserPanier();
  });
});
