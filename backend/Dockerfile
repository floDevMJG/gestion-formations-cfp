# Utiliser une image Node.js légère
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Installer les dépendances système pour nodemailer
RUN apk add --no-cache \
    ca-certificates \
    && update-ca-certificates

# Copier les fichiers de configuration
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production && npm cache clean --force

# Copier le code source
COPY . .

# Créer le répertoire uploads s'il n'existe pas
RUN mkdir -p uploads

# Exposer le port
EXPOSE 5000

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=5000

# Commande de démarrage avec monitoring
CMD ["sh", "-c", "npm start"]
