/**
 * Requête API 4/6 — GET /products/{id} (Swagger)
 */
describe('API 4 — GET /products/{id}', () => {
  it('retourne les détails d\'un produit existant', () => {
    cy.fixture('products').then((products) => {
      cy.request('GET', `http://localhost:8081/products/${products.inStock.id}`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.include({
          id: products.inStock.id,
          name: products.inStock.name,
        });
        expect(response.body).to.have.property('availableStock');
        expect(response.body).to.have.property('price');
      });
    });
  });
});