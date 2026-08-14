# Bilan de campagne de test : Eco Bliss Bath

| Nom | Fonction | Version | Date | Signature |
|-----|----------|---------|------|-----------|
| Gaëtan Pruvot | QA Engineer | 3.2 | 14 août 2026 | |

---

## I. Recommandations

### Analyse des documents de Marie et de Fabio

**Est-ce que tout a été testé par Marie ?**

Non. Marie a couvert les parcours critiques : navigation, connexion, inscription, catalogue, panier, commande, avis, XSS, et l'API via Swagger et Postman. Restent hors périmètre :

- les tests multi-navigateurs systématiques ;
- les tests de charge et de performance ;
- l'accessibilité ;
- une campagne de régression rejouable à chaque livraison.

Marie a posé les bases et signalé les zones à risque (panier, stock, XSS). Elle n'a pas industrialisé la régression, ce qui est précisément l'objet de cette campagne.

Deux points de son bilan méritent d'être requalifiés :

- **401 au lieu de 403 sur `GET /orders` sans authentification.** Ce n'est pas une anomalie. Le 401 signale un utilisateur non authentifié, le 403 un utilisateur authentifié sans les droits. La réponse de l'application est conforme. Le test `api-2-orders-sans-token` asserte donc 401.
- **`PUT` au lieu de `POST` sur `/orders/add`.** Écart de conception REST réel, mais sans effet sur le comportement métier. Il est signalé ici, sans test dédié.

**Est-ce que je suis d'accord avec Fabio ?**

Oui. API, smoke et XSS sont les bons piliers :

- l'API contrôle le back-end sans dépendre de l'affichage, donc rapidement et de façon stable ;
- les smoke tests répondent en quelques secondes à « le site est-il utilisable après déploiement ? » ;
- le XSS de l'espace avis est une faille déjà identifiée par Marie, à surveiller en continu.

Je n'ajoute aucune catégorie obligatoire. L'inscription et le tunnel de commande complet restent utiles mais hors budget.

**Quels sont les tests les plus critiques ?**

| Critère | Lecture pour Eco Bliss Bath |
|---------|-----------------------------|
| Fréquence | Connexion et accès au panier reviennent à chaque achat, tout comme `POST /login` et `GET /orders`. |
| Criticité | Panier : impact financier. XSS : sécurité et image. Connexion : bloquant pour tout le reste. |
| Couverture | Les smoke tests balaient plusieurs pages en quelques secondes. Les tests API ne dépendent pas du navigateur. |
| Complexité | Connexion et smoke : simples, les `data-cy` sont en place. Panier : moyen (authentification et état). Commande complète : trop lourde pour ce budget. |

**Y a-t-il des tests répétitifs ?**

Oui : connexion d'un compte valide, liens de navigation, `POST /login`, `GET /orders`, accès au panier avec et sans authentification, ajout d'un produit. Ce sont les premiers candidats à l'automatisation.

**Y a-t-il des tests complexes ?**

Oui : parcours de commande complet, modification de quantité avec délai côté front, XSS à la fois côté API et côté rendu, gestion des stocks négatifs. Ils sont traités en priorité par l'API, ou reportés.

### A. Tests à automatiser

| # | Catégorie | Décision | Justification |
|---|-----------|----------|---------------|
| 1 | Tests API | Automatiser (obligatoire) | Rapides, stables, indépendants de l'interface |
| 2 | Smoke tests | Automatiser (obligatoire) | Filet de sécurité après déploiement |
| 3 | XSS avis | Automatiser (obligatoire) | Sécurité, faille déjà identifiée |
| 4 | Connexion | Automatiser (1/2) | Très fréquent, point d'entrée des parcours authentifiés, simple à scripter |
| 5 | Panier | Automatiser (2/2) | Impact financier direct, zone à anomalies (stock) |
| 6 | Affichage des produits | Reporter | Déjà couvert par les smoke tests et `GET /products` |

Les deux scénarios fonctionnels retenus sont donc **la connexion** et **le panier**. L'affichage catalogue reste important, mais avec deux scénarios seulement, le risque métier est plus élevé sur la connexion et le panier.

### B. Préconisations pour la suite

Quand le budget le permettra, dans cet ordre :

1. Affichage détaillé des produits, si un E2E plus poussé que le smoke est souhaité
2. Inscription : données uniques et nettoyage de compte
3. Validation de commande complète
4. Modification de quantité et suppression d'une ligne du panier
5. Exécution de la campagne en intégration continue à chaque merge
6. Généralisation multi-navigateurs (Chrome, Firefox, Edge)

Les tests exploratoires, d'UX et visuels restent manuels.

---

## II. Tests automatisés

### Contexte

| Élément | Détail |
|---------|--------|
| Projet | Eco Bliss Bath V2, première mise en production |
| Type de tests | Automatisés, end-to-end et API, avec Cypress 15.18.0 (JavaScript) |
| Équipe | 1 QA Engineer (automatisation) ; campagne manuelle initiale par Marie |
| Environnement | Front Angular 13 sur `localhost:4200`, API Symfony 6.2 et MariaDB 11.7 via Docker sur `localhost:8081` |
| Navigateur | Electron (Chromium) en `cypress run` |
| Dépôt | https://github.com/GP-OCR/Eco-Bliss-Bath |
| Rapport | `cypress/reports/index.html` (mochawesome fusionné) |

L'application n'a été modifiée à aucun moment : les anomalies sont documentées, pas corrigées.

### Objectifs

Objectif principal : automatiser les tests critiques pour garantir la non-régression du parcours d'achat à chaque livraison.

Objectifs secondaires :

- vérifier les 6 requêtes API du bilan de Marie, en cas nominal et en cas d'erreur ;
- automatiser les 2 scénarios fonctionnels retenus : connexion et panier ;
- établir si une faille XSS subsiste dans l'espace commentaire ;
- mettre en place des smoke tests de disponibilité.

### Tests effectués

**35 tests** répartis en deux suites de nature différente.

| Suite | Dossier | Nombre | Rôle |
|-------|---------|--------|------|
| Régression | `api/`, `e2e/`, `smoke-test/` | 24 | Décrit le comportement attendu et conforme. Un échec = une régression. |
| Anomalies | `anomalies/` | 11 | Asserte la règle métier correcte. Un échec = la preuve du défaut. |

Ce découpage est un choix de méthode. Un test d'anomalie qui asserterait le comportement buggé (par exemple `expect(status).to.eq(200)` là où un refus est attendu) verrouillerait le défaut et deviendrait rouge le jour de sa correction. Les tests d'anomalie assertent donc la règle attendue et servent, après correctif, de tests de non-régression.

Les données d'authentification sont centralisées dans des fixtures. Les actions communes sont regroupées dans des commandes personnalisées : `loginApi`, `authRequest`, `loginUi`, `setAuthToken`, `creerUtilisateur`, `viderPanier`, `reinitialiserPanier`, `produitDisponible`. Aucun `cy.wait()` fixe : la synchronisation repose sur la retry-ability de `cy.get`/`should`, sur `cy.request` et sur les alias de route. Sur une fiche produit, chaque interaction (saisie de quantité, clic sur « ajouter ») est précédée de l'attente du chargement du produit (`detail-product-name`) : sans elle, sur une machine lente, le clic partait avant l'initialisation du formulaire et aucune requête n'était émise, et le test échouait alors sans défaut applicatif. Cette attente garantit un résultat identique quelle que soit la vitesse de la machine, y compris pour l'évaluateur. Les contrôles qui suivent un clic portent sur la requête interceptée et non sur l'URL, une assertion négative sur l'URL étant vraie avant même que la navigation ait pu se produire. Les URL de l'API sont lues dans `Cypress.env('apiUrl')`.

#### 1. Tests API : les 6 requêtes de Marie

| Fichier | Requête | Attendu |
|---------|---------|---------|
| `api-1-login` | `POST /login` valide puis invalide | 200 + token, puis 401 |
| `api-2-orders-sans-token` | `GET /orders` sans token | 401 |
| `api-3-orders-avec-token` | `GET /orders` avec token | 200 + `orderLines` |
| `api-4-products-id` | `GET /products/{id}` | 200 + fiche produit |
| `api-5-orders-add-disponible` | `PUT /orders/add` produit en stock | 200 + ligne créée |
| `api-6-post-reviews` | `POST /reviews` | 200/201 + avis publié |

La 7e requête demandée par Marie, l'ajout d'un produit en rupture de stock, relève d'une règle métier non respectée : elle est traitée dans la suite d'anomalies.

#### 2. Tests fonctionnels

**Connexion** : identifiants valides, identifiants invalides, déconnexion.

**Panier** : accès sans authentification (redirection), ajout d'un produit disponible depuis l'interface, quantité négative bloquée par le formulaire Angular (aucune requête émise, contrôlé par interception de route), suppression d'une ligne.

**Cohérence du stock** : le stock affiché doit refléter la quantité placée au panier.

**XSS** : aucun JavaScript injecté n'est exécuté au rendu.

#### 3. Smoke tests

Accueil et navigation complète, liste des produits, page des avis, formulaire de connexion, formulaire d'inscription, bouton d'ajout au panier après connexion, accès au panier avec et sans authentification.

#### 4. Suite d'anomalies

| Fichier | Règle métier assertée | Tests |
|---------|----------------------|-------|
| `anomalie-1-stock-insuffisant` | Refuser un produit en rupture, une quantité supérieure au stock, une quantité supérieure à 20, côté API et côté interface | 4 |
| `anomalie-2-quantite-invalide` | Refuser une quantité nulle ou négative | 2 |
| `anomalie-3-commande-panier-vide` | Refuser une commande sans article | 1 |
| `anomalie-4-panier-inexistant` | Retourner 200 et un panier vide pour un nouvel utilisateur | 1 |
| `anomalie-5-stock-negatif` | N'exposer aucun produit à stock négatif | 1 |
| `anomalie-6-xss-avis` | Échapper le HTML d'un commentaire, côté back et côté front | 2 |

### Résultats de tests

| Indicateur | Valeur |
|------------|--------|
| Tests exécutés | 35 |
| Suite de régression | 24 réussis, 0 en échec |
| Suite d'anomalies | 1 réussi, 10 en échec |
| Anomalies distinctes | 6 |

La suite de régression est verte : le parcours nominal fonctionne et la campagne est rejouable. Les 10 échecs de la suite d'anomalies ne sont pas des défauts de test mais des écarts de l'application, tous reproductibles en requête directe. Le test vert de cette suite (`anomalie-2`, quantité négative) confirme que le back-end refuse déjà une quantité négative : cette règle est respectée et sert de test de non-régression.

---

## III. Rapports d'incident

### BUG-01 : Aucun contrôle de stock à l'ajout au panier

- **Criticité** : majeure. **Niveau** : back-end
- **Reproduction** : `PUT /orders/add` avec une quantité supérieure à `availableStock`, avec une quantité de 21 sur un produit dont le stock est inférieur (cas limite du bilan de Marie), ou avec un produit en rupture. Le produit en rupture est sélectionné dynamiquement (premier produit dont le stock est inférieur ou égal à 0) plutôt que par un identifiant figé, afin que le test reste fiable d'une campagne à l'autre quand le stock a déjà été consommé.
- **Attendu** : refus 4xx. **Obtenu** : 200, ligne de panier créée.
- **Impact** : survente, commandes impossibles à honorer, litiges clients.
- **Correction** : comparer `quantity` et `availableStock` avant création de la ligne.

### BUG-02 : Quantité nulle acceptée

- **Criticité** : mineure. **Niveau** : back-end
- **Reproduction** : `PUT /orders/add` avec `quantity: 0`.
- **Attendu** : refus 4xx. **Obtenu** : 200. La quantité négative (`quantity: -1`), elle, est déjà refusée par le back-end (400) : ce cas est conforme et couvert par un test vert.
- **Impact** : lignes de panier parasites, totaux incohérents.
- **Correction** : n'accepter qu'une quantité entière supérieure ou égale à 1. Le front applique `Validators.min(0)` : il faut également passer à 1.

### BUG-03 : Commande validée avec un panier vide

- **Criticité** : majeure. **Niveau** : back-end
- **Reproduction** : créer un panier, le vider, puis `POST /orders` avec une adresse valide.
- **Attendu** : refus 4xx. **Obtenu** : 200 et `validated: true`.
- **Impact** : commandes fantômes, incohérence comptable et logistique.
- **Correction** : refuser la validation si le panier ne contient aucune ligne.

### BUG-04 : `GET /orders` renvoie 404 pour un panier jamais créé

- **Criticité** : faible. **Niveau** : back-end
- **Reproduction** : créer un compte, appeler `GET /orders` sans avoir rien ajouté.
- **Attendu** : 200 et `orderLines: []`. **Obtenu** : 404.
- **Impact** : incohérence REST, le front doit traiter une erreur pour un cas nominal.
- **Correction** : distinguer panier inexistant et panier vide.

### BUG-05 : Produits à stock négatif exposés au catalogue

- **Criticité** : majeure. **Niveau** : back-end et données
- **Reproduction** : `GET /products`, le produit 3 « Sentiments printaniers » remonte un `availableStock` négatif.
- **Attendu** : aucun stock inférieur à 0. **Obtenu** : valeur négative affichée sur la fiche produit.
- **Impact** : conséquence directe de BUG-01. Affichage incohérent pour le client.
- **Correction** : borner le stock à 0 et corriger les données existantes après correction de BUG-01.

### BUG-06 : Commentaires d'avis stockés et rendus sans échappement

- **Criticité** : majeure. **Niveau** : back-end et front-end
- **Reproduction** : `POST /reviews` avec un commentaire contenant du HTML, puis `GET /reviews` ; consulter ensuite `/#/reviews`.
- **Attendu** : contenu rejeté ou échappé, affichage en texte. **Obtenu** : payload stockée brute côté API, et interprétée côté front : le composant avis rend le commentaire avec `[innerHTML]`, donc les balises sont injectées dans le DOM.
- **Nuance** : l'exécution de JavaScript est bloquée. Le sanitizer d'Angular retire les balises `script` du rendu `[innerHTML]`. L'injection HTML, elle, est bien effective.
- **Impact** : défiguration de la page avis, hameçonnage par lien ou contenu injecté. Le risque d'exécution repose entièrement sur une protection du framework, sans aucun contrôle applicatif : toute évolution du rendu rouvre la faille.
- **Correction** : échapper le contenu côté back-end à l'enregistrement, et remplacer `[innerHTML]` par une interpolation côté front. Les deux, en défense en profondeur.

### Synthèse

6 anomalies, toutes d'origine back-end, dont une avec un versant front-end (BUG-06). Aucune régression sur le parcours nominal. Aucun faux positif Cypress.

---

## IV. Confiance

**Confiance dans la suite de tests** : bonne. 24 tests de régression verts, exécution reproductible, aucun test instable observé, données de test sélectionnées dynamiquement.

**Confiance dans l'application** : insuffisante.

**Décision : NO GO.**

Priorité de correction :

| Priorité | ID | Motif |
|----------|-----|-------|
| 1 | BUG-01 | Survente : impact financier direct et immédiat |
| 2 | BUG-03 | Commandes fantômes : incohérence comptable et logistique |
| 3 | BUG-06 | Injection HTML dans un contenu public, protection uniquement implicite |
| 4 | BUG-05 | Affichage incohérent, se résorbe après BUG-01 et reprise des données |
| 5 | BUG-02 | Lignes de panier parasites |
| 6 | BUG-04 | Incohérence REST, gêne le front |

BUG-01, BUG-03 et BUG-06 doivent être corrigés avant la mise en production. Les autres peuvent suivre dans un correctif rapproché.

Après correctifs, relancer la campagne complète : la suite d'anomalies doit passer au vert et la suite de régression le rester.
