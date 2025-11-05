# Guide de déploiement Vercel

## Configuration préparée

L'application est maintenant configurée pour être déployée sur Vercel sans problème.

### Fichiers de configuration créés

1. **`vercel.json`** : Configuration principale de Vercel
   - Build command : `npm run build`
   - Output directory : `dist/public`
   - Runtime : Node.js 20.x
   - Routes configurées pour API et SPA

2. **`api/index.ts`** : Serverless function pour Vercel
   - Gère les routes API et le routage SPA
   - Initialisation asynchrone pour éviter les problèmes de performance

3. **`.vercelignore`** : Fichiers à ignorer lors du déploiement

4. **`tsconfig.json`** : Mis à jour pour inclure le dossier `api/`

### Structure du déploiement

```
/
├── api/
│   └── index.ts          # Serverless function Vercel
├── dist/
│   └── public/            # Fichiers statiques buildés
├── vercel.json           # Configuration Vercel
└── package.json           # Dépendances et scripts
```

## Étapes de déploiement

### Option 1 : Via l'interface Vercel (Recommandé)

1. **Connecter votre repository GitHub**
   - Allez sur [vercel.com](https://vercel.com)
   - Cliquez sur "New Project"
   - Importez votre repository GitHub

2. **Configuration automatique**
   - Vercel détectera automatiquement `vercel.json`
   - Les paramètres suivants seront appliqués automatiquement :
     - Build Command: `npm run build`
     - Output Directory: `dist/public`
     - Install Command: `npm install`

3. **Variables d'environnement** (si nécessaire)
   - Dans les paramètres du projet, section "Environment Variables"
   - Ajoutez vos variables si nécessaire (ex: `DATABASE_URL`, `SESSION_SECRET`, etc.)

4. **Déployer**
   - Cliquez sur "Deploy"
   - Vercel construira et déploiera votre application

### Option 2 : Via Vercel CLI

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer
vercel

# Pour la production
vercel --prod
```

## Comment ça fonctionne

1. **Build** : `npm run build` génère :
   - Les fichiers statiques React dans `dist/public/`
   - Le serveur Express compilé dans `dist/index.js`

2. **Routing** :
   - Les routes `/api/*` sont gérées par `api/index.ts` (serverless function)
   - Les fichiers statiques (JS, CSS, images) sont servis automatiquement depuis `dist/public/`
   - Toutes les autres routes sont redirigées vers `api/index.ts` qui sert `index.html` pour le SPA

3. **Performance** :
   - Les fichiers statiques sont servis via le CDN de Vercel
   - Les routes API utilisent des serverless functions (cold start ~50-100ms)

## Vérification post-déploiement

1. Vérifiez que l'application charge correctement
2. Testez la navigation entre les pages
3. Vérifiez que les routes API fonctionnent (si vous en avez)
4. Testez le routage SPA (recharger une page comme `/dashboard`)

## Dépannage

### Erreur : "Cannot find module"
- Vérifiez que toutes les dépendances sont dans `package.json`
- Assurez-vous que `npm install` s'exécute sans erreur

### Erreur : "Build failed"
- Vérifiez les logs de build dans Vercel
- Testez `npm run build` localement

### Les fichiers statiques ne se chargent pas
- Vérifiez que `outputDirectory` dans `vercel.json` correspond au répertoire de build
- Vérifiez que les fichiers sont bien générés dans `dist/public/`

### Le routage SPA ne fonctionne pas
- Vérifiez que la dernière rewrite dans `vercel.json` redirige vers `/api/index.ts`
- Vérifiez que `api/index.ts` sert bien `index.html` pour les routes non-API

## Support

Pour toute question, consultez la [documentation Vercel](https://vercel.com/docs).

