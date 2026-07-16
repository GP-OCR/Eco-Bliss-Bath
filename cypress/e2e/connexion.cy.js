/**
 * Scénario fonctionnel 1/2 — Connexion utilisateur (recommandation partie I)
 */
describe('Fonctionnel — Connexion', () => {
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
    });
  });
});