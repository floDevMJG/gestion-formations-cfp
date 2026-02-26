-- Script d'initialisation MySQL pour Railway
-- Ce script sera exécuté automatiquement lors du premier déploiement

-- Création de la base de données si elle n'existe pas
CREATE DATABASE IF NOT EXISTS gestion_formations;

-- Utilisation de la base de données
USE gestion_formations;

-- Import des tables principales
-- Note: Railway va automatiquement créer les variables d'environnement
-- RAILWAY_MYSQL_HOST, RAILWAY_MYSQL_USER, RAILWAY_MYSQL_PASSWORD, etc.

-- Tables de base (à adapter selon votre structure existante)
-- Les fichiers SQL spécifiques seront exécutés via les migrations du backend
