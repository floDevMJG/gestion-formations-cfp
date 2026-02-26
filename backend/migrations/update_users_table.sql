-- Ajout des champs manquants à la table Users
ALTER TABLE `Users`
ADD COLUMN `telephone` VARCHAR(20) DEFAULT NULL AFTER `password`,
ADD COLUMN `adresse` TEXT DEFAULT NULL AFTER `telephone`,
ADD COLUMN `statut` ENUM('en_attente', 'valide', 'rejete', 'actif', 'inactif') DEFAULT 'en_attente' AFTER `role`,
ADD COLUMN `photo` VARCHAR(255) DEFAULT NULL AFTER `statut`,
MODIFY COLUMN `email` VARCHAR(255) NOT NULL,
MODIFY COLUMN `password` VARCHAR(255) NOT NULL,
MODIFY COLUMN `role` ENUM('admin', 'formateur', 'apprenant') NOT NULL DEFAULT 'apprenant';
