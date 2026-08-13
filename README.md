<div align="center">

# OpenClassrooms - Eco Bliss Bath

</div>

<p align="center">
    <img src="https://img.shields.io/badge/MariaDB-v11.7.2-blue">
    <img src="https://img.shields.io/badge/Symfony-v6.2-blue">
    <img src="https://img.shields.io/badge/Angular-v13.3.0-blue">
    <img src="https://img.shields.io/badge/Cypress-v15.18-brightgreen">
  <br><br>
</p>

# Contexte

Projet 10 — automatisation des tests de la boutique en ligne **Eco Bliss Bath**.

Ce dépôt est la copie du projet fournie par OpenClassrooms, à laquelle sont ajoutés
les tests automatisés. Ils sont écrits en **JavaScript** avec **Cypress** et couvrent
l'API, les smoke tests, la faille XSS et deux scénarios fonctionnels (connexion et panier).

Le code de l'application n'a pas été modifié : les anomalies sont documentées dans
`Bilan-campagne-test.md`, pas corrigées.

# Prérequis

- Docker
- Node.js 18 ou plus
- npm

# Démarrage de l'application

## API et base de données

Depuis la racine du dépôt :

```bash
docker compose up -d
```

- API : http://localhost:8081
- Swagger : http://localhost:8081/api/doc

Attendre que tous les conteneurs soient en état `healthy` avant de lancer les tests.

## Front-end

```bash
cd frontend
npm install
npm start
```

Le front-end est accessible sur http://localhost:4200

# Installation des tests

Depuis la racine du dépôt, dans un second terminal :

```bash
npm install
```

## Compte de test

| Champ | Valeur |
|-------|--------|
| Email | `test2@test.fr` |
| Mot de passe | `testtest` |

Défini dans `cypress/fixtures/users.json`.

## Configuration

`cypress.config.js` expose deux points d'entrée :

| Paramètre | Valeur par défaut | Surcharge |
|-----------|-------------------|-----------|
| `baseUrl` (front) | `http://localhost:4200` | `CYPRESS_baseUrl=...` |
| `env.apiUrl` (API) | `http://localhost:8081` | `CYPRESS_apiUrl=...` |

Aucune URL n'est codée en dur dans les tests.

# Lancer les tests

```bash
# Suite de regression seule : doit etre entierement verte
npm run test:regression

# Suite d'anomalies seule : chaque echec est la preuve d'un defaut de l'application
npm run test:anomalies

# Campagne complete + rapport HTML fusionne
npm test

# Interface Cypress (ecriture et debogage)
npm run cypress:open
```

`npm test` exécute les deux suites. Le résultat global est donc **en échec par
construction** : les tests d'anomalie assertent la règle métier attendue, que
l'application ne respecte pas encore. Voir « Deux suites, deux rôles » plus bas.

## Rapport de test

`npm test` enchaîne trois étapes : exécution, fusion des JSON par spec
(`mochawesome-merge`), génération du HTML (`marge`).

```
cypress/reports/index.html
```

Cette fusion est indispensable : sans elle, mochawesome écrase son fichier de sortie
à chaque spec et le rapport ne contient que la dernière.

# Périmètre

Selon les consignes de Fabio (CTO) :

| Catégorie | Obligatoire ? | Contenu |
|-----------|---------------|---------|
| Tests API | Oui | Les 6 requêtes du bilan de Marie |
| Smoke tests | Oui | Pages, navigation et formulaires essentiels |
| XSS avis | Oui | Faille dans l'espace commentaire |
| Tests fonctionnels | 2 sur 3 | Connexion et panier |

## Choix des 2 scénarios fonctionnels

| Scénario | Décision | Pourquoi |
|----------|----------|----------|
| **Connexion** | Automatisé | Point d'entrée de tous les parcours authentifiés |
| **Panier** | Automatisé | Impact financier direct (stock, commande) |
| **Affichage des produits** | Écarté | Déjà couvert par les smoke tests et `GET /products` |

# Organisation

```
├── README.md
├── Bilan-campagne-test.md
├── docker-compose.yml          # application fournie par OpenClassrooms
├── data/                       # jeu de donnees d'initialisation MariaDB
├── frontend/                   # application Angular fournie
├── package.json                # dependances et scripts de test
├── cypress.config.js
└── cypress/
    ├── api/            # 6 requetes du bilan de Marie, cas nominaux
    ├── e2e/            # connexion, panier, coherence du stock, XSS
    ├── smoke-test/     # pages, navigation, formulaires
    ├── anomalies/      # regles metier non respectees par l'application
    ├── fixtures/       # users, products, reviews
    ├── reports/        # rapport HTML (apres npm test)
    └── support/        # commands.js, e2e.js
```

## Deux suites, deux rôles

**Suite de régression** (`api/`, `e2e/`, `smoke-test/`) — 24 tests. Elle décrit le
comportement attendu et actuellement conforme. Un échec signale une régression.

**Suite d'anomalies** (`anomalies/`) — 11 tests. Chaque test asserte la règle métier
correcte ; son échec est la preuve reproductible du défaut. Ces tests repasseront au
vert quand les correctifs seront livrés, ce qui en fait aussi les tests de
non-régression des correctifs.

Un test d'anomalie ne doit jamais asserter le comportement buggé : il verrouillerait
le bug et deviendrait rouge le jour de sa correction.

## Détail des tests API

| Fichier | Requête | Objectif |
|---------|---------|----------|
| `api-1-login` | `POST /login` | Token JWT valide / 401 si invalide |
| `api-2-orders-sans-token` | `GET /orders` | Accès refusé sans token (401) |
| `api-3-orders-avec-token` | `GET /orders` | Panier de l'utilisateur connecté |
| `api-4-products-id` | `GET /products/{id}` | Détail d'un produit |
| `api-5-orders-add-disponible` | `PUT /orders/add` | Ajout d'un produit en stock |
| `api-6-post-reviews` | `POST /reviews` | Publication d'un avis |

La 7e requête du bilan de Marie — ajout d'un produit en rupture de stock — est traitée
dans `anomalies/anomalie-1-stock-insuffisant.cy.js` : le comportement attendu est un
refus, l'application accepte.

## Détail des anomalies

| Fichier | Règle métier assertée |
|---------|----------------------|
| `anomalie-1-stock-insuffisant` | Refuser un produit en rupture, une quantité supérieure au stock, une quantité de 21 sur un produit au stock inférieur (API et interface) |
| `anomalie-2-quantite-invalide` | Refuser une quantité nulle ou négative |
| `anomalie-3-commande-panier-vide` | Refuser la validation d'une commande sans article |
| `anomalie-4-panier-inexistant` | Retourner 200 et un panier vide pour un nouvel utilisateur |
| `anomalie-5-stock-negatif` | N'exposer aucun produit à stock négatif |
| `anomalie-6-xss-avis` | Échapper le contenu HTML d'un commentaire (back-end et front-end) |

## Commandes personnalisées

Définies dans `cypress/support/commands.js` :

| Commande | Rôle |
|----------|------|
| `cy.loginApi()` | Connexion via l'API, récupère le JWT |
| `cy.authRequest()` | Requête API avec header `Authorization` |
| `cy.loginUi()` | Connexion via le formulaire Angular |
| `cy.setAuthToken()` | Place le token dans le `localStorage` |
| `cy.creerUtilisateur()` | Crée un compte de test unique |
| `cy.viderPanier(token)` | Vide le panier d'un utilisateur |
| `cy.reinitialiserPanier()` | Vide le panier du compte de test |
| `cy.produitDisponible(stockMin)` | Sélectionne dynamiquement un produit en stock |

`cy.produitDisponible()` remplace les identifiants de produit codés en dur : le stock
est consommé au fil des campagnes, un id figé finit par ne plus être disponible et rend
la suite non rejouable.

## Conventions d'écriture

- Sélection par attributs `data-cy` uniquement, jamais par texte ou par classe CSS.
- Aucun `cy.wait()` sur un délai fixe : la synchronisation repose sur la retry-ability
  de `cy.get`/`should`, sur `cy.request` et sur les alias de route (`cy.intercept`).
- Une assertion négative sur l'URL après un clic n'est jamais utilisée : elle serait
  vraie avant même que la navigation ait pu se produire. Le contrôle porte sur la
  requête interceptée.
- Les données d'authentification et les produits de référence sont centralisés dans
  `cypress/fixtures/`.

## Stack

| Outil | Version |
|-------|--------|
| Cypress | 15.18.0 |
| Rapport | mochawesome + mochawesome-merge + marge |
| Langage | JavaScript |
