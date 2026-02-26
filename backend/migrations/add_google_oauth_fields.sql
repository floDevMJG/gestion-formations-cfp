-- Migration pour ajouter les champs Google OAuth à la table Users

ALTER TABLE Users 
ADD COLUMN googleId VARCHAR(255) NULL UNIQUE AFTER emailVerificationExpires,
ADD COLUMN googleAccessToken TEXT NULL AFTER googleId,
ADD COLUMN googleRefreshToken TEXT NULL AFTER googleAccessToken;

-- Ajout d'index pour googleId pour optimiser les recherches
CREATE INDEX idx_users_google_id ON Users(googleId);
