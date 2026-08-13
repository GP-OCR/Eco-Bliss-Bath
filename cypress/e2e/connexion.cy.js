/**
 * Scenario fonctionnel 1/2 - Connexion
 * Point d'entree de tous les parcours authentifies.
 */
describe('Fonctionnel - Connexion', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it('connecte un utilisateur avec des identifiants valides', () => {
    cy.fixture('users').then((users) => {
      cy.visit('/#/login');
      cy.get('[data-cy="login-input-username"]').type(users.validUser.username);
      cy.get('[data-cy="login-input-password"]').type(users.validUser.password);
      cy.get('[data-cy="login-submit"]').click();

      cy.get('[data-cy="nav-link-cart"]').should('be.visible');
      cy.get('[data-cy="nav-link-logout"]').should('be.visible');
      cy.get('[data-cy="nav-link-login"]').should('not.exist');
    });
  });

  it('affiche une erreur avec des identifiants invalides', () => {
    cy.fixture('users').then((users) => {
      cy.visit('/#/login');
      cy.get('[data-cy="login-input-username"]').type(users.invalidUser.username);
      cy.get('[data-cy="login-input-password"]').type(users.invalidUser.password);
      cy.get('[data-cy="login-submit"]').click();

      cy.get('[data-cy="login-errors"]').should('contain', 'Identifiants incorrects');
      cy.get('[data-cy="nav-link-login"]').should('be.visible');
      cy.get('[data-cy="nav-link-cart"]').should('not.exist');
    });
  });

  it('deconnecte l\'utilisateur et revient a l\'etat anonyme', () => {
    cy.loginUi();
    cy.get('[data-cy="nav-link-logout"]').click();
    cy.get('[data-cy="nav-link-login"]').should('be.visible');
    cy.get('[data-cy="nav-link-cart"]').should('not.exist');
  });
});
