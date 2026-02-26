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

# Étape 2: Production avec nginx
FROM nginx:alpine

# Copier le build depuis l'étape précédente
COPY --from=build /app/build /usr/share/nginx/html

# Copier la configuration nginx simple
COPY nginx-simple.conf /etc/nginx/conf.d/default.conf

# Exposer le port 80
EXPOSE 80

# Démarrer nginx
CMD ["nginx", "-g", "daemon off;"]
