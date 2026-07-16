/**
 * Requête API 1/6 — POST /login (Swagger)
 */
describe('API 1 — POST /login', () => {
  it('retourne un token JWT pour des identifiants valides', () => {
    cy.loginApi('validUser').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('token');
      expect(response.body.token).to.be.a('string').and.not.be.empty;
    });
  });

  it('retourne 401 pour des identifiants invalides', () => {
    cy.loginApi('invalidUser').then((response) => {
      expect(response.status).to.eq(401);
    });
  });
});