# Database Migrations (Prisma)

Ce projet utilise maintenant Prisma pour les migrations incrémentales dans `@js-monorepo/server`.
La configuration Prisma v7 est centralisée dans `server/prisma.config.ts`.

## Commandes

### Développement

- `npm run db:generate --workspace=@js-monorepo/server`
- `npm run db:migrate:dev --workspace=@js-monorepo/server`
- `npm run db:studio --workspace=@js-monorepo/server`
- `npm run db:push --workspace=@js-monorepo/server` (prototypage local uniquement)
- `npm run db:seed --workspace=@js-monorepo/server`

Variables optionnelles pour le volume du seed:

- `SEED_USERS` (défaut: `80`)
- `SEED_REQUESTS_PER_USER` (défaut: `4`)
- `SEED_COMMENTS_PER_REQUEST` (défaut: `6`)

Variables optionnelles pour vider la base avant seed:

- `CLEAR_BEFORE_SEED=true`
- `ALLOW_PROD_RESET=true` (requis en production si `CLEAR_BEFORE_SEED=true`)

### Production

- `npm run db:migrate:baseline --workspace=@js-monorepo/server` (une seule fois si la base existe déjà)
- `npm run db:migrate:deploy --workspace=@js-monorepo/server`

### Railway: peupler une fois (sans vider)

Objectif: ajouter des données de test sans supprimer l'existant.

1. Commande pre-deploy temporaire:
   - `sh -c 'npm run db:migrate:deploy --workspace=@js-monorepo/server && ALLOW_PROD_SEED=true npm run db:seed --workspace=@js-monorepo/server'`
2. Lancer un redeploy.
3. Remettre la commande pre-deploy standard:
   - `npm run db:migrate:deploy --workspace=@js-monorepo/server`
4. Redéployer.

### Railway: vider puis peupler une fois

Objectif: repartir d'une base vide puis injecter des données de test.

1. Commande pre-deploy temporaire:
   - `sh -c 'npm run db:migrate:deploy --workspace=@js-monorepo/server && ALLOW_PROD_SEED=true ALLOW_PROD_RESET=true CLEAR_BEFORE_SEED=true npm run db:seed --workspace=@js-monorepo/server'`
2. Lancer un redeploy.
3. Remettre la commande pre-deploy standard:
   - `npm run db:migrate:deploy --workspace=@js-monorepo/server`
4. Redéployer.

Ne pas laisser `db:seed` en pre-deploy en continu.

### Railway: seed léger pour test rapide

Pour limiter la volumétrie au premier essai, utiliser temporairement:

- `sh -c 'npm run db:migrate:deploy --workspace=@js-monorepo/server && ALLOW_PROD_SEED=true ALLOW_PROD_RESET=true CLEAR_BEFORE_SEED=true SEED_USERS=5 SEED_REQUESTS_PER_USER=2 SEED_COMMENTS_PER_REQUEST=2 npm run db:seed --workspace=@js-monorepo/server'`

Puis revenir au pre-deploy standard après validation.

## Important

- L'ancien script destructif `server/bin/migrate.ts` est conservé en mode **legacy** (`db:migrate:legacy`) mais il est désactivé et refuse explicitement l'exécution.
- Ne jamais utiliser `DROP DATABASE` en production.
- Ne jamais utiliser `prisma migrate reset` en production.
- Ne jamais utiliser `prisma db push` en production.
- Le seed est bloqué en production par défaut (`ALLOW_PROD_SEED=true` requis pour forcer).
- Le clear avant seed supprime les données (`CLEAR_BEFORE_SEED=true`), et en production exige `ALLOW_PROD_RESET=true`.
- Le clear suit l'ordre `comment -> request -> user -> role` pour respecter les contraintes FK.
- `deleteMany()` ne réinitialise pas forcément les auto-increments, ce qui est acceptable pour l'app.

## Procédure safe pour une base de production déjà existante

1. Configurer `DATABASE_URL` vers la base existante.
2. Introspecter la structure actuelle:
   - `node ./server/bin/prisma.js db pull` (depuis la racine du monorepo)
3. Générer le client:
   - `npm run db:generate --workspace=@js-monorepo/server`
4. Baseline de migration (sans rejouer de SQL destructif):
   - marquer la migration initiale comme déjà appliquée sur la prod:
   - `npm run db:migrate:baseline --workspace=@js-monorepo/server`
5. Ensuite, utiliser uniquement:
   - `npm run db:migrate:deploy --workspace=@js-monorepo/server`

## Variable d'environnement requise

- `DATABASE_URL=mysql://USER:PASSWORD@HOST:3306/DB_NAME`
