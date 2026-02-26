-- Script de création de la table Cours pour la gestion des cours PDF
-- Base de données: gestion_formations

-- Suppression de la table si elle existe (pour recréation propre)
DROP TABLE IF EXISTS `Cours`;

-- Création de la table Cours
CREATE TABLE `Cours` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `formationId` INT NOT NULL,
  `formateurId` INT NOT NULL,
  `titre` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `date` DATE,
  `heureDebut` TIME,
  `heureFin` TIME,
  `salle` VARCHAR(100),
  `type` ENUM('cours', 'td', 'tp', 'examen', 'pdf') DEFAULT 'cours',
  `fichierUrl` VARCHAR(500),
  `fichierNom` VARCHAR(255),
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Clés étrangères
  FOREIGN KEY (`formationId`) REFERENCES `Formations`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`formateurId`) REFERENCES `Users`(`id`) ON DELETE CASCADE,
  
  -- Index pour optimisation
  INDEX `idx_formation` (`formationId`),
  INDEX `idx_formateur` (`formateurId`),
  INDEX `idx_type` (`type`),
  INDEX `idx_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertion de données de test pour les cours PDF
INSERT INTO `Cours` (`formationId`, `formateurId`, `titre`, `description`, `type`, `fichierUrl`, `fichierNom`) VALUES
(1, 1, 'Introduction à la charpente navale', 'Cours d\'introduction aux principes fondamentaux de la charpente navale', 'pdf', 'uploads/cours/introduction-charpente-navale.pdf', 'introduction-charpente-navale.pdf'),
(1, 1, 'Calcul des structures', 'Méthodes de calcul des charges et résistances dans la construction navale', 'pdf', 'uploads/cours/calcul-structures.pdf', 'calcul-structures.pdf'),
(2, 1, 'Maintenance des moteurs diesel', 'Guide complet d\'entretien des moteurs marins diesel', 'pdf', 'uploads/cours/maintenance-moteurs-diesel.pdf', 'maintenance-moteurs-diesel.pdf'),
(2, 1, 'Systèmes de propulsion', 'Étude des différents systèmes de propulsion marine', 'pdf', 'uploads/cours/systemes-propulsion.pdf', 'systemes-propulsion.pdf'),
(3, 1, 'Navigation côtière', 'Techniques de navigation près des côtes et en eaux intérieures', 'pdf', 'uploads/cours/navigation-cotiere.pdf', 'navigation-cotiere.pdf'),
(3, 1, 'Cartographie marine', 'Lecture et interprétation des cartes marines', 'pdf', 'uploads/cours/cartographie-marine.pdf', 'cartographie-marine.pdf');

-- Affichage des données insérées pour vérification
SELECT 
  c.id,
  c.titre,
  c.description,
  c.type,
  c.fichierNom,
  f.titre as formation_titre,
  u.nom as formateur_nom,
  u.prenom as formateur_prenom
FROM Cours c
LEFT JOIN Formations f ON c.formationId = f.id
LEFT JOIN Users u ON c.formateurId = u.id
ORDER BY c.createdAt DESC;
