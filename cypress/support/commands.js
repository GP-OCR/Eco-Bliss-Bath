const API_URL = Cypress.env('apiUrl');

// --- Authentification -------------------------------------------------------

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
    expect(loginResponse.status, 'authentification prealable').to.eq(200);
    return cy.request({
      method,
      url: `${API_URL}${endpoint}`,
      headers: { Authorization: `Bearer ${loginResponse.body.token}` },
      failOnStatusCode: options.failOnStatusCode !== false,
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

// Compte neuf : isole les tests qui dependent d'un panier jamais initialise.
Cypress.Commands.add('creerUtilisateur', () => {
  const email = `qa${Date.now()}${Math.floor(Math.random() * 1000)}@test.fr`;
  return cy.request({
    method: 'POST',
    url: `${API_URL}/register`,
    body: {
      email,
      plainPassword: { first: 'testtest', second: 'testtest' },
      firstname: 'Qa',
      lastname: 'Test',
    },
  }).then(() => {
    return cy.request({
      method: 'POST',
      url: `${API_URL}/login`,
      body: { username: email, password: 'testtest' },
    });
  });
});

// --- Etat du panier ---------------------------------------------------------

Cypress.Commands.add('viderPanier', (token) => {
  return cy.request({
    method: 'GET',
    url: `${API_URL}/orders`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  }).then((response) => {
    if (response.status !== 200) {
      return;
    }
    const lignes = response.body.orderLines || [];
    lignes.forEach((ligne) => {
      cy.request({
        method: 'DELETE',
        url: `${API_URL}/orders/${ligne.id}/delete`,
        headers: { Authorization: `Bearer ${token}` },
        failOnStatusCode: false,
      });
    });
  });
});

// Vide le panier du compte de test avant un scenario.
Cypress.Commands.add('reinitialiserPanier', () => {
  return cy.loginApi().then((response) => cy.viderPanier(response.body.token));
});

// --- Selection de donnees ---------------------------------------------------

// Evite les identifiants de produit codes en dur : le stock est consomme au fil
// des campagnes, un id fige finit par ne plus etre disponible.
Cypress.Commands.add('produitDisponible', (stockMinimum = 1) => {
  return cy.request('GET', `${API_URL}/products`).then((response) => {
    const produit = response.body.find((p) => p.availableStock >= stockMinimum);
    expect(produit, `produit avec un stock >= ${stockMinimum}`).to.exist;
    return produit;
  });
});
