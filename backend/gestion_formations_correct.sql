-- Script SQL compatible avec les modèles Sequelize
-- Base de données : gestion_formations

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- --------------------------------------------------------
-- Structure de la table `Users` (Sequelize utilise le pluriel)
-- --------------------------------------------------------

DROP TABLE IF EXISTS `Users`;
CREATE TABLE `Users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) DEFAULT NULL,
  `prenom` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Structure de la table `Formations`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `Formations`;
CREATE TABLE `Formations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titre` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `duree` varchar(255) DEFAULT NULL,
  `niveau` varchar(255) DEFAULT NULL,
  `places` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Structure de la table `Inscriptions`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `Inscriptions`;
CREATE TABLE `Inscriptions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) DEFAULT NULL,
  `formationId` int(11) DEFAULT NULL,
  `dateInscription` datetime DEFAULT NULL,
  `montant` decimal(10,2) DEFAULT NULL,
  `methodePaiement` varchar(255) DEFAULT NULL,
  `numeroTelephone` varchar(255) DEFAULT NULL,
  `statutPaiement` varchar(255) DEFAULT 'en_attente',
  `referencePaiement` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `formationId` (`formationId`),
  CONSTRAINT `Inscriptions_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Inscriptions_ibfk_2` FOREIGN KEY (`formationId`) REFERENCES `Formations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Structure de la table `Cours` (Emploi du temps)
-- --------------------------------------------------------

DROP TABLE IF EXISTS `Cours`;
CREATE TABLE `Cours` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `formationId` int(11) DEFAULT NULL,
  `formateurId` int(11) DEFAULT NULL,
  `titre` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  `heureDebut` time DEFAULT NULL,
  `heureFin` time DEFAULT NULL,
  `salle` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT 'cours',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `formationId` (`formationId`),
  KEY `formateurId` (`formateurId`),
  CONSTRAINT `Cours_ibfk_1` FOREIGN KEY (`formationId`) REFERENCES `Formations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Cours_ibfk_2` FOREIGN KEY (`formateurId`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Structure de la table `Presences`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `Presences`;
CREATE TABLE `Presences` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `coursId` int(11) DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  `statut` varchar(255) DEFAULT 'absent',
  `date` datetime DEFAULT NULL,
  `remarque` text DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `coursId` (`coursId`),
  KEY `userId` (`userId`),
  CONSTRAINT `Presences_ibfk_1` FOREIGN KEY (`coursId`) REFERENCES `Cours` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Presences_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Insertion d'un utilisateur admin par défaut
-- Mot de passe hashé avec bcrypt pour "admin123"
-- --------------------------------------------------------

INSERT INTO `Users` (`nom`, `prenom`, `email`, `password`, `role`, `createdAt`, `updatedAt`) VALUES
('Admin', 'Système', 'admin@cfp.com', '$2a$10$rOzJqJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq', 'admin', NOW(), NOW());

-- Note: Le mot de passe ci-dessus est un hash de test. 
-- Pour créer un vrai hash pour "admin123", utilisez bcrypt dans Node.js :
-- const bcrypt = require('bcryptjs');
-- const hash = await bcrypt.hash('admin123', 10);
-- Puis remplacez le hash ci-dessus par le résultat

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
