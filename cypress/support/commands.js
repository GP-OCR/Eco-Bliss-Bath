const API_URL = 'http://localhost:8081';

Cypress.Commands.add('loginApi', (userKey = 'validUser') => {
  return cy.fixture('users').then((users) => {
    return cy.request({
      method: 'POST',
      url: `${API_URL}/login`,
      body: users[userKey],
      failOnStatusCode: false,
    });
  });
});

Cypress.Commands.add('authRequest', (method, endpoint, options = {}) => {
  return cy.loginApi().then((loginResponse) => {
    expect(loginResponse.status).to.eq(200);
    return cy.request({
      method,
      url: `${API_URL}${endpoint}`,
      headers: { Authorization: `Bearer ${loginResponse.body.token}` },
      failOnStatusCode: options.failOnStatusCode ?? true,
      body: options.body,
    });
  });
});

Cypress.Commands.add('loginUi', (userKey = 'validUser') => {
  cy.fixture('users').then((users) => {
    const user = users[userKey];
    cy.visit('/#/login');
    cy.get('[data-cy="login-input-username"]').clear().type(user.username);
    cy.get('[data-cy="login-input-password"]').clear().type(user.password);
    cy.get('[data-cy="login-submit"]').click();
    cy.get('[data-cy="nav-link-cart"]', { timeout: 10000 }).should('be.visible');
  });
});

Cypress.Commands.add('setAuthToken', () => {
  cy.visit('/#/');
  cy.loginApi().then((response) => {
    expect(response.status).to.eq(200);
    cy.window().then((win) => {
      win.localStorage.setItem('user', response.body.token);
    });
  });
});