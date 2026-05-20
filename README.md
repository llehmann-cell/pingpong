# PinPang Strava

Prototype responsive d'une application type Strava pour le tennis de table.

## Lancer en local

Le mode par défaut garde la direction artistique de cette branche et sert le site responsive:

```bash
npm run preview
```

Puis ouvrir `http://127.0.0.1:8081`.

La branche contient aussi le registre de `main`: API Express, authentification, ranking Glicko-2, tables, joueurs, matchs à confirmer et notes adversaires.
Pour activer l'API, copier `server/.env.example` vers `server/.env`, renseigner `DATABASE_URL` et `JWT_SECRET`, puis relancer `npm run preview`.

Le prototype Expo de `main` est conservé dans `App.native.js`:

```bash
npm run preview:expo
```
