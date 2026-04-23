# AGENTS.md

## Resume Projet
- Nom logique: `rentEasy`
- Type: application web de location type Airbnb
- Depot organise en deux parties:
  - backend Spring Boot dans `jar/`
  - frontend Angular dans `front/`
- Le projet repose sur une API REST consommee par le frontend Angular

## Stack Technique
- Backend: Java 21, Spring Boot 3.2.5
- Modules backend principaux: Spring Web, Spring Data JPA, Validation, Lombok
- Base de donnees: PostgreSQL
- Frontend: Angular 18 avec composants standalone
- Build backend: Maven via `pom.xml`
- Build frontend: npm via `front/package.json`

## Structure du Depot
- `pom.xml`: build Maven principal
- `jar/src/main/java/rentEasy/`: code backend
- `jar/src/main/resources/application.properties`: configuration Spring
- `front/src/app/`: application Angular
- `front/src/environments/`: environnements Angular
- `README.md`: liens projet et donnees de test temporaires

## Points d'Entree
- Backend: `jar/src/main/java/rentEasy/ApplicationStarter.java`
- Frontend: `front/src/main.ts`
- Routing Angular: `front/src/app/app.routes.ts`
- Configuration Angular globale: `front/src/app/app.config.ts`

## Architecture Backend
- `controller/`: endpoints REST
- `service/`: logique metier
- `repository/`: acces base via Spring Data JPA
- `model/`: entites JPA
- `controller/dto/`: objets de sortie API pour certaines ressources
- `config/`: configuration web, notamment CORS
- `dataBase/`: classes historiques de configuration et utilitaires base

## Ressources Backend Principales
- `AuthController`: login via `/api/auth/login`
- `UserController`: CRUD via `/api/users` et `/api/user`
- `PropertyController`: CRUD via `/api/properties` et `/api/property`
- `BookingController`: CRUD via `/api/bookings`
- `ReviewController`: CRUD via `/api/reviews`

## Architecture Frontend
- `core/`: auth guard, auth interceptor, auth service, modele utilisateur
- `features/auth/`: ecrans login et register
- `features/home/`: page d'accueil
- `features/properties/`: liste et detail des logements
- `features/bookings/`: service et modele de reservation
- `features/reviews/`: service et modele d'avis
- `features/dashboard/`: espace utilisateur connecte
- `features/users/`: service utilisateur
- `layout/`: composants de structure comme navbar et sidebar
- `features/crudService.ts`: base generique pour les services HTTP CRUD

## Routes Angular Connues
- `/`
- `/login`
- `/register`
- `/properties`
- `/properties/:id`
- `/dashboard`

## Authentification et Securite Applicative
- Le frontend appelle `POST /api/auth/login`
- Le token recu est stocke dans `localStorage` sous la cle `token`
- L'interceptor Angular ajoute `Authorization: Bearer <token>` a chaque requete si un token est present
- Le guard Angular protege actuellement la route `/dashboard`
- Le service backend d'auth genere un token JWT signe manuellement en HMAC SHA-256

## Communication Front/Back
- URL d'API frontend en dev: `http://localhost:8080/api`
- CORS backend autorise actuellement `http://localhost:4200` et `http://localhost:8080`
- Le frontend utilise des services Angular par ressource et s'appuie sur `CrudService`

## Particularites Importantes
- Le backend expose parfois des routes singulieres et plurielles en parallele
- Exemple:
  - utilisateurs: `/api/users` et `/api/user`
  - logements: `/api/properties` et `/api/property`
- Le frontend utilise actuellement des URLs singulieres pour certains services:
  - `PropertyService` appelle `/api/property`
  - `UserService` appelle `/api/user`
  - `BookingService` appelle `/api/booking`
  - `ReviewService` appelle `/api/review`
- Attention: `BookingController` et `ReviewController` exposes dans le code lu utilisent seulement les formes plurielles `/api/bookings` et `/api/reviews`
- Toute modification de contrat API doit verifier cette coherence avant merge

## Commandes Utiles
- Backend:
  - `mvn spring-boot:run`
  - `mvn test`
  - `mvn clean package`
- Frontend:
  - `cd front`
  - `npm start`
  - `npm test`
  - `npm run build`

## Demarrage Local Recommande
1. Lancer le backend a la racine avec `mvn spring-boot:run`
2. Lancer le frontend dans `front/` avec `npm start`
3. Ouvrir `http://localhost:4200`
4. Verifier que les appels partent bien vers `http://localhost:8080/api`

## Fichiers a Lire en Priorite Selon le Besoin
- Si le sujet concerne l'auth:
  - `front/src/app/core/auth.service.ts`
  - `front/src/app/core/auth.guard.ts`
  - `front/src/app/core/auth.interceptor.ts`
  - `jar/src/main/java/rentEasy/controller/AuthController.java`
  - `jar/src/main/java/rentEasy/service/AuthService.java`
- Si le sujet concerne les logements:
  - `front/src/app/features/properties/`
  - `jar/src/main/java/rentEasy/controller/PropertyController.java`
  - `jar/src/main/java/rentEasy/service/PropertyService.java`
- Si le sujet concerne reservations ou avis:
  - verifier en premier la coherence entre services Angular et endpoints Spring

## Regles de Modification
- Lire la feature ciblee avant de modifier du code
- Limiter les changements au scope demande
- Verifier l'impact front/back quand un contrat API change
- Preserver le prefixe `/api` cote backend
- Si un endpoint est renomme, mettre a jour simultanement:
  - controleur backend
  - service Angular correspondant
  - route ou composant qui le consomme
- Favoriser des DTOs cote backend quand une entite ne doit pas etre exposee telle quelle

## Points de Vigilance
- Le depot contient actuellement des secrets et identifiants dans `jar/src/main/resources/application.properties`
- Le `README.md` contient aussi des informations sensibles ou temporaires
- Ne pas recopier ces secrets dans de nouveaux fichiers, logs, tests ou commits
- Priorite recommandee: sortir ces valeurs vers des variables d'environnement ou un fichier local non versionne
- `front/src/environments/environment.prod.ts` contient encore une URL placeholder
- Le depot peut contenir des modifications utilisateur non liees a la tache en cours: ne pas les ecraser

## Donnees de Test
- Un utilisateur de test est mentionne dans `README.md`
- Considerer ces informations comme temporaires et non adaptees a la production

## Attentes Pour Un Agent
- Commencer par identifier si la demande touche le front, le back ou le contrat API entre les deux
- En cas de bug reseau ou de 404, verifier d'abord l'alignement entre services Angular et `@RequestMapping`
- En cas de bug d'acces a une page, verifier guard, token localStorage et route Angular
- En cas de bug de persistance, verifier entite, repository, service, puis configuration PostgreSQL
- Signaler explicitement toute incoherence entre routes Angular, endpoints Spring et modeles de donnees
