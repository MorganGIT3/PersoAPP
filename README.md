# AppPerso

Application de gestion personnelle avec calendrier, revenus et abonnements.

## Déploiement sur Vercel

### Prérequis
- Compte Vercel
- Repository GitHub connecté

### Étapes de déploiement

1. **Connecter le repository à Vercel**
   - Allez sur [vercel.com](https://vercel.com)
   - Importez le projet depuis GitHub
   - Vercel détectera automatiquement la configuration

2. **Variables d'environnement** (si nécessaire)
   - Ajoutez vos variables d'environnement dans les paramètres du projet Vercel
   - Exemple : `DATABASE_URL`, `SESSION_SECRET`, etc.

3. **Build**
   - Le build se fait automatiquement avec `npm run build`
   - Les fichiers statiques sont générés dans `dist/public`
   - L'API serverless est dans `api/index.ts`

### Structure
- `client/` : Application React/Vite frontend
- `server/` : Backend Express
- `api/` : Serverless function pour Vercel
- `dist/public/` : Fichiers statiques buildés

## Développement local

```bash
npm install
npm run dev
```

L'application sera accessible sur `http://localhost:5000`

## Build

```bash
npm run build
```

## Scripts disponibles

- `npm run dev` : Lance le serveur de développement
- `npm run build` : Build la production
- `npm run start` : Lance le serveur de production
- `npm run check` : Vérifie les erreurs TypeScript

