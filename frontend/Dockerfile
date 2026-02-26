# Étape 1: Build
FROM node:18-alpine as build

WORKDIR /app

# Copier les fichiers de configuration
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le code source
COPY . .

# Construire l'application
RUN npm run build

# Étape 2: Production avec Node.js
FROM node:18-alpine

WORKDIR /app

# Copier le build depuis l'étape précédente
COPY --from=build /app/build ./build

# Copier le serveur statique
COPY serve-static.js .

# Exposer le port 3000
EXPOSE 3000

# Démarrer le serveur
CMD ["npm", "run", "serve"]
