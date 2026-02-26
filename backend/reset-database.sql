-- Script pour réinitialiser la base de données
-- ATTENTION: Ce script supprime toutes les données existantes!

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `Presences`;
DROP TABLE IF EXISTS `Cours`;
DROP TABLE IF EXISTS `Inscriptions`;
DROP TABLE IF EXISTS `Formations`;
DROP TABLE IF EXISTS `Users`;

-- Supprimer aussi les anciennes tables si elles existent
DROP TABLE IF EXISTS `presences`;
DROP TABLE IF EXISTS `sessions_formation`;
DROP TABLE IF EXISTS `paiements`;
DROP TABLE IF EXISTS `inscriptions`;
DROP TABLE IF EXISTS `formations`;
DROP TABLE IF EXISTS `users`;

SET FOREIGN_KEY_CHECKS = 1;

-- Maintenant, exécutez le script gestion_formations_correct.sql
