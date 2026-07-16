# Eco-Bliss-Bath — Tests Cypress

Tests automatisés en **JavaScript** pour la boutique en ligne **Eco Bliss Bath**.

Projet 10 de la formation **Testeur Logiciel** (OpenClassrooms).

Ce dépôt contient **uniquement les tests**. L'application (frontend Angular + API Symfony) doit tourner à part.

## Catégories de tests

| Catégorie | Dossier | Description |
|-----------|---------|-------------|
| **API** | `cypress/api/` | Requêtes Swagger (login, panier, produits, avis) |
| **Fonctionnels** | `cypress/e2e/` | Connexion et ajout au panier (2 scénarios sur 3) |
| **XSS** | `cypress/e2e/xss-avis.cy.js` + `api-8` | Injection dans l'espace commentaire |
| **Smoke** | `cypress/smoke-test/` | Pages principales accessibles |

## Prérequis

- [Node.js](https://nodejs.org/) 18 ou plus
- Application Eco Bliss Bath démarrée :
  - Frontend : [http://localhost:4200](http://localhost:4200)
  - API : [http://localhost:8081](http://localhost:8081)

Vérifier l'API :

```bash
curl http://localhost:8081/api/health
```

## Installation

```bash
git clone https://github.com/GP-OCR/Eco-Bliss-Bath.git
cd Eco-Bliss-Bath
npm install
```

## Lancer les tests

```bash
# Interface Cypress
npm run cypress:open

# Tous les tests en mode headless
npm run cypress:run
```

Par catégorie :

```bash
npx cypress run --spec "cypress/api/**/*.cy.js"
npx cypress run --spec "cypress/e2e/**/*.cy.js"
npx cypress run --spec "cypress/smoke-test/**/*.cy.js"
```

## Compte de test

| Champ | Valeur |
|-------|--------|
| Email | `test2@test.fr` |
| Mot de passe | `testtest` |

(défini dans `cypress/fixtures/users.json`)

## Organisation des specs

### API (`cypress/api/`)

| Fichier | Requête | Objectif |
|---------|---------|----------|
| `api-1-login.cy.js` | `POST /login` | Token JWT valide / 401 invalide |
| `api-2-orders.cy.js` | `GET /orders` | Accès refusé sans token (401) |
| `api-3-orders.cy.js` | `GET /orders` | Panier avec token (200) |
| `api-4-products-id.cy.js` | `GET /products/{id}` | Détail d'un produit |
| `api-5-orders-add.cy.js` | `PUT /orders/add` | Ajout produit en stock |
| `api-6-orders-add.cy.js` | `PUT /orders/add` | Produit en rupture accepté (anomalie) |
| `api-7-post-reviews.cy.js` | `POST /reviews` | Publication d'un avis |
| `api-8-post-reviews-xss.cy.js` | `POST /reviews` | Payload XSS stockée |

### Fonctionnels + XSS (`cypress/e2e/`)

| Fichier | Scénario |
|---------|----------|
| `connexion.cy.js` | Connexion valide et invalide |
| `ajout-produit-panier.cy.js` | Ajout au panier (UI) + anomalie stock |
| `xss-avis.cy.js` | XSS via le formulaire d'avis |

### Smoke (`cypress/smoke-test/`)

| Fichier | Scénario |
|---------|----------|
| `smoke-home.cy.js` | Accueil, catalogue, page connexion |
| `smoke-panier.cy.js` | Panier sans / avec authentification |

## Structure du dépôt

```
Eco-Bliss-Bath/
├── README.md
├── package.json
├── cypress.config.js
└── cypress/
    ├── api/
    ├── e2e/
    ├── smoke-test/
    ├── fixtures/       # users, products, reviews
    └── support/        # commands.js, e2e.js
```

## Commandes personnalisées

Définies dans `cypress/support/commands.js` :

| Commande | Rôle |
|----------|------|
| `cy.loginApi()` | Connexion via l'API, récupère le JWT |
| `cy.authRequest()` | Requête API avec header Authorization |
| `cy.loginUi()` | Connexion via le formulaire Angular |
| `cy.setAuthToken()` | Place le token dans le localStorage |

## Stack

| Outil | Version |
|-------|---------|
| Cypress | 15.18.0 |
| Langage | JavaScript |
