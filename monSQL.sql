-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : jeu. 26 fév. 2026 à 06:01
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `gestion_formations`
--

DELIMITER $$
--
-- Procédures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `verifier_disponibilite_conge` (IN `p_user_id` INT, IN `p_jours_demandes` INT, IN `p_annee` INT, OUT `p_jours_disponibles` INT, OUT `p_peut_demander` BOOLEAN)   BEGIN
    SELECT jours_restants_annuel INTO p_jours_disponibles
    FROM conges_stats 
    WHERE user_id = p_user_id AND annee = p_annee;
    
    SET p_peut_demander = (p_jours_disponibles >= p_jours_demandes);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `verifier_disponibilite_permission` (IN `p_user_id` INT, IN `p_heures_demandees` DECIMAL(4,2), IN `p_annee` INT, IN `p_mois` INT, OUT `p_heures_disponibles` DECIMAL(6,2), OUT `p_peut_demander` BOOLEAN)   BEGIN
    SELECT heures_restantes_mois INTO p_heures_disponibles
    FROM conges_stats 
    WHERE user_id = p_user_id AND annee = p_annee AND mois = p_mois;
    
    SET p_peut_demander = (p_heures_disponibles >= p_heures_demandees);
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `annonces_apprenants`
--

CREATE TABLE `annonces_apprenants` (
  `id` int(11) NOT NULL,
  `titre` varchar(255) NOT NULL,
  `contenu` text NOT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `annonces_apprenants`
--

INSERT INTO `annonces_apprenants` (`id`, `titre`, `contenu`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'Rémise de bulettin de note', 'réuinion avec les étudiants et les formateur ', 2, '2026-02-19 14:23:33', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `annonces_formateurs`
--

CREATE TABLE `annonces_formateurs` (
  `id` int(11) NOT NULL,
  `titre` varchar(255) NOT NULL,
  `contenu` text NOT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `annonces_formateurs`
--

INSERT INTO `annonces_formateurs` (`id`, `titre`, `contenu`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'Réunion', 'réunion à 16h 30', 2, '2026-02-16 23:49:35', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `ateliers`
--

CREATE TABLE `ateliers` (
  `id` int(11) NOT NULL,
  `titre` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `date` date NOT NULL,
  `heure_debut` time NOT NULL,
  `heure_fin` time NOT NULL,
  `salle` varchar(100) NOT NULL,
  `capacite` int(11) NOT NULL DEFAULT 20,
  `inscrits` int(11) DEFAULT 0,
  `type` enum('pratique','theorique','hybride') DEFAULT 'pratique',
  `statut` enum('actif','annulé','terminé') DEFAULT 'actif',
  `formateur_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `ateliers`
--

INSERT INTO `ateliers` (`id`, `titre`, `description`, `date`, `heure_debut`, `heure_fin`, `salle`, `capacite`, `inscrits`, `type`, `statut`, `formateur_id`, `created_at`, `updated_at`) VALUES
(1, 'Atelier Charpente Marine Traditionnelle', 'Apprentissage des techniques traditionnelles de charpenterie marine : assemblages, jointures et travail du bois pour la construction navale', '2024-01-15', '09:00:00', '12:00:00', 'Atelier Naval 101', 20, 15, 'pratique', 'actif', 4, '2026-01-29 12:31:05', '2026-01-30 12:05:48'),
(2, 'Atelier Construction Coque en Bois', 'Maîtrise des techniques de construction de coques en bois : bordé, membrures et renforts pour bateaux traditionnels', '2024-01-18', '14:00:00', '17:00:00', 'Atelier Naval 102', 15, 12, 'pratique', 'actif', 4, '2026-01-29 12:31:05', '2026-01-30 12:05:48'),
(3, 'Atelier Vitrerie Marine', 'Techniques de vitrerie marine : pose de hublots, fenêtres et vitrages spécifiques pour les embarcations', '2024-01-22', '10:00:00', '13:00:00', 'Atelier Naval 103', 18, 16, 'pratique', 'actif', 4, '2026-01-29 12:31:05', '2026-01-30 12:05:48'),
(4, 'sodure ', 'sodure marine', '2026-02-17', '07:47:00', '10:47:00', 'salle A', 1, 0, 'pratique', 'actif', 22, '2026-02-16 23:48:22', '2026-02-16 23:48:22'),
(5, 'cm', 'cn', '2026-02-20', '09:30:00', '11:30:00', 'salle A', 20, 0, 'pratique', 'actif', 22, '2026-02-19 06:56:43', '2026-02-19 06:56:43'),
(7, 'Fibre ', 'Faire du fibre du bateau ', '2026-02-20', '09:30:00', '11:30:00', 'Salle A', 20, 0, 'theorique', 'actif', 22, '2026-02-19 19:33:47', '2026-02-19 19:33:47'),
(8, 'CN', '', '2026-02-20', '08:00:00', '09:00:00', 'Salle 1', 20, 0, 'pratique', 'actif', 22, '2026-02-19 19:48:05', '2026-02-19 19:48:05'),
(9, 'cm', '', '2026-02-16', '08:00:00', '09:00:00', 'Atelier Naval 102', 20, 0, 'pratique', 'actif', 22, '2026-02-19 19:54:40', '2026-02-19 19:54:40'),
(10, 'Atelier Vitrerie Marine', '', '2026-02-20', '08:00:00', '09:00:00', 'Salle A', 20, 0, 'pratique', 'actif', 22, '2026-02-19 20:02:16', '2026-02-19 20:02:16'),
(11, 'Fibre ', '', '2026-02-20', '08:00:00', '09:00:00', 'Salle A', 20, 0, 'theorique', 'actif', 22, '2026-02-19 20:02:36', '2026-02-19 20:02:36'),
(12, 'cm', '', '2026-02-20', '08:00:00', '09:00:00', 'Salle A', 20, 0, 'pratique', 'actif', 22, '2026-02-19 20:05:13', '2026-02-19 20:05:13'),
(13, 'cm', '', '2026-02-20', '09:00:00', '10:00:00', 'Salle A', 20, 0, 'pratique', 'actif', 22, '2026-02-19 20:05:31', '2026-02-19 20:05:31'),
(14, 'Fibre ', '', '2026-02-20', '10:00:00', '11:00:00', 'Salle A', 20, 0, 'theorique', 'actif', 22, '2026-02-19 20:05:52', '2026-02-19 20:05:52'),
(15, 'Fibre ', '', '2026-02-20', '11:00:00', '12:00:00', 'Salle A', 20, 0, 'theorique', 'actif', 22, '2026-02-19 20:06:09', '2026-02-19 20:06:09'),
(16, 'cm', '', '2026-02-20', '08:00:00', '09:00:00', 'salle A', 20, 0, 'pratique', 'actif', 22, '2026-02-19 20:13:52', '2026-02-19 20:13:52'),
(17, 'cm', '', '2026-02-20', '09:00:00', '10:00:00', 'salle A', 20, 0, 'pratique', 'actif', 22, '2026-02-19 20:14:13', '2026-02-19 20:14:13'),
(18, 'Calcul des structures', '', '2026-02-20', '10:00:00', '11:00:00', 'Atelier Naval 101', 20, 0, 'theorique', 'actif', 22, '2026-02-19 20:21:49', '2026-02-19 20:21:49'),
(19, 'Calcul des structures', '', '2026-02-20', '11:00:00', '12:00:00', 'Atelier Naval 101', 20, 0, 'theorique', 'actif', 22, '2026-02-19 20:22:03', '2026-02-19 20:22:03'),
(20, 'Calcul des structures', '', '2026-02-16', '08:00:00', '09:00:00', 'Atelier Naval 101', 20, 0, 'theorique', 'actif', 22, '2026-02-20 13:21:49', '2026-02-20 13:21:49'),
(21, 'Atelier Construction Coque en Bois', '', '2026-02-16', '09:00:00', '10:00:00', 'Atelier Naval 103', 20, 0, 'pratique', 'actif', 22, '2026-02-20 13:22:03', '2026-02-20 13:22:03'),
(22, 'Calcul des structures', '', '2026-02-25', '08:00:00', '09:00:00', 'Atelier Naval 101', 20, 0, 'theorique', 'actif', 33, '2026-02-25 09:40:58', '2026-02-25 09:40:58');

-- --------------------------------------------------------

--
-- Structure de la table `conges`
--

CREATE TABLE `conges` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `user_name` varchar(255) NOT NULL,
  `user_email` varchar(255) NOT NULL,
  `user_role` enum('admin','formateur','apprenant') NOT NULL,
  `type_conge` enum('annuel','maladie','maternite','exceptionnel') NOT NULL,
  `date_debut` date NOT NULL,
  `date_fin` date NOT NULL,
  `jours_demandes` int(11) NOT NULL,
  `motif` text NOT NULL,
  `contact_urgence` varchar(255) DEFAULT NULL,
  `telephone_urgence` varchar(50) DEFAULT NULL,
  `statut` enum('en_attente','approuve','refuse','en_cours') DEFAULT 'en_attente',
  `date_demande` datetime NOT NULL DEFAULT current_timestamp(),
  `date_validation` datetime DEFAULT NULL,
  `validateur_id` int(11) DEFAULT NULL,
  `validateur_name` varchar(255) DEFAULT NULL,
  `motif_refus` text DEFAULT NULL,
  `documents` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`documents`)),
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déclencheurs `conges`
--
DELIMITER $$
CREATE TRIGGER `update_conges_stats_on_insert` AFTER INSERT ON `conges` FOR EACH ROW BEGIN
    INSERT INTO conges_stats (user_id, user_name, user_role, annee)
    VALUES (NEW.user_id, NEW.user_name, NEW.user_role, YEAR(NEW.date_debut))
    ON DUPLICATE KEY UPDATE
        conges_en_attente = conges_en_attente + 1,
        updated_at = CURRENT_TIMESTAMP;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `update_conges_stats_on_update` AFTER UPDATE ON `conges` FOR EACH ROW BEGIN
    -- Si le statut change de en_attente à approuve
    IF OLD.statut = 'en_attente' AND NEW.statut = 'approuve' THEN
        UPDATE conges_stats 
        SET 
            conges_en_attente = conges_en_attente - 1,
            jours_pris_annee = jours_pris_annee + NEW.jours_demandes,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = NEW.user_id AND annee = YEAR(NEW.date_debut);
    
    -- Si le statut change de approuve à refuse (remboursement des jours)
    ELSEIF OLD.statut = 'approuve' AND NEW.statut = 'refuse' THEN
        UPDATE conges_stats 
        SET 
            jours_pris_annee = GREATEST(0, jours_pris_annee - NEW.jours_demandes),
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = NEW.user_id AND annee = YEAR(NEW.date_debut);
    
    -- Si le statut change de en_attente à refuse
    ELSEIF OLD.statut = 'en_attente' AND NEW.statut = 'refuse' THEN
        UPDATE conges_stats 
        SET 
            conges_en_attente = conges_en_attente - 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = NEW.user_id AND annee = YEAR(NEW.date_debut);
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `conges_stats`
--

CREATE TABLE `conges_stats` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `user_name` varchar(255) NOT NULL,
  `user_role` enum('admin','formateur','apprenant') NOT NULL,
  `total_jours_annuel` int(11) DEFAULT 30,
  `jours_pris_annee` int(11) DEFAULT 0,
  `conges_en_attente` int(11) DEFAULT 0,
  `total_jours_mensuel` int(11) DEFAULT 5,
  `heures_prises_mois` decimal(6,2) DEFAULT 0.00,
  `permissions_en_attente` int(11) DEFAULT 0,
  `annee` int(11) DEFAULT year(current_timestamp()),
  `mois` int(11) DEFAULT month(current_timestamp()),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `cours`
--

CREATE TABLE `cours` (
  `id` int(11) NOT NULL,
  `formationId` int(11) DEFAULT NULL,
  `formateurId` int(11) DEFAULT NULL,
  `titre` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  `heureDebut` time DEFAULT NULL,
  `heureFin` time DEFAULT NULL,
  `salle` varchar(255) DEFAULT NULL,
  `type` enum('cours','td','tp','examen','pdf') DEFAULT 'cours',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `fichierUrl` varchar(500) DEFAULT NULL,
  `fichierNom` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `cours`
--

INSERT INTO `cours` (`id`, `formationId`, `formateurId`, `titre`, `description`, `date`, `heureDebut`, `heureFin`, `salle`, `type`, `createdAt`, `updatedAt`, `fichierUrl`, `fichierNom`) VALUES
(1, 1, 4, 'Introduction à la charpente navale', 'Cours d\'introduction aux principes fondamentaux de la charpente navale', NULL, NULL, NULL, NULL, 'pdf', '0000-00-00 00:00:00', '0000-00-00 00:00:00', 'uploads/cours/introduction-charpente-navale.pdf', 'introduction-charpente-navale.pdf'),
(2, 1, 4, 'Calcul des structures', 'Méthodes de calcul des charges et résistances dans la construction navale', NULL, NULL, NULL, NULL, 'pdf', '0000-00-00 00:00:00', '0000-00-00 00:00:00', 'uploads/cours/calcul-structures.pdf', 'calcul-structures.pdf'),
(3, 2, 4, 'Maintenance des moteurs diesel', 'Guide complet d\'entretien des moteurs marins diesel', NULL, NULL, NULL, NULL, 'pdf', '0000-00-00 00:00:00', '0000-00-00 00:00:00', 'uploads/cours/maintenance-moteurs-diesel.pdf', 'maintenance-moteurs-diesel.pdf'),
(4, 2, 4, 'Systèmes de propulsion', 'Étude des différents systèmes de propulsion marine', NULL, NULL, NULL, NULL, 'pdf', '0000-00-00 00:00:00', '0000-00-00 00:00:00', 'uploads/cours/systemes-propulsion.pdf', 'systemes-propulsion.pdf'),
(5, 3, 4, 'Navigation côtière', 'Techniques de navigation près des côtes et en eaux intérieures', NULL, NULL, NULL, NULL, 'pdf', '0000-00-00 00:00:00', '0000-00-00 00:00:00', 'uploads/cours/navigation-cotiere.pdf', 'navigation-cotiere.pdf'),
(6, 3, 4, 'Cartographie marine', 'Lecture et interprétation des cartes marines', NULL, NULL, NULL, NULL, 'pdf', '0000-00-00 00:00:00', '0000-00-00 00:00:00', 'uploads/cours/cartographie-marine.pdf', 'cartographie-marine.pdf'),
(7, 1, 22, 'CM', 'Nouveau', NULL, NULL, NULL, NULL, 'pdf', '2026-02-18 19:24:59', '2026-02-18 19:24:59', 'uploads/cours/cours-1771442699758-328210650.pdf', 'CV.pdf');

-- --------------------------------------------------------

--
-- Structure de la table `formations`
--

CREATE TABLE `formations` (
  `id` int(11) NOT NULL,
  `titre` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `duree` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `placesDisponibles` int(11) NOT NULL DEFAULT 0,
  `dateDebut` date DEFAULT NULL,
  `statut` enum('ouverte','en_cours','terminee','annulee') DEFAULT 'ouverte',
  `prix` decimal(10,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `formations`
--

INSERT INTO `formations` (`id`, `titre`, `description`, `duree`, `createdAt`, `updatedAt`, `placesDisponibles`, `dateDebut`, `statut`, `prix`) VALUES
(1, 'Charpente Navale', 'Formation complète en construction et réparation navale.', '12 mois', '2026-01-23 13:06:07', '2026-01-29 10:05:22', 12, '2024-09-01', 'ouverte', 1200000.00),
(2, 'Mécanique Marine', 'Spécialisation en moteurs et systèmes marins.', '10 mois', '2026-01-28 15:38:48', '2026-01-29 10:05:22', 10, '2024-09-01', 'ouverte', 1000000.00),
(3, 'Navigation Côtière', 'Maîtrise de la navigation et de la sécurité en mer. Cartographie, météo, règles de barre et balisage.', '6 mois', '2026-01-28 15:38:48', '2026-01-28 16:10:14', 15, '2024-04-01', 'en_cours', 800000.00),
(4, 'Électricité Bateau', 'Installation et maintenance des systèmes électriques marins. Circuits 12V/24V/220V, batteries, panneaux solaires, électronique de bord.', '8 mois', '2026-01-28 15:38:48', '2026-01-28 16:10:14', 10, '2024-05-01', 'ouverte', 900000.00),
(5, 'FPI', 'Formation Professionnelle Initial ', '3 ans', '2026-02-03 17:07:18', '2026-02-03 17:08:06', 0, NULL, 'ouverte', 0.00),
(6, 'jtyjtjt', 'fsgfsgds', '20', '2026-02-16 12:28:24', '2026-02-16 12:28:24', 0, NULL, 'ouverte', 0.00);

-- --------------------------------------------------------

--
-- Structure de la table `inscriptions`
--

CREATE TABLE `inscriptions` (
  `id` int(11) NOT NULL,
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
  `statut` enum('en_attente','validee','refusee') DEFAULT 'en_attente',
  `motifRejet` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `inscriptions`
--

INSERT INTO `inscriptions` (`id`, `userId`, `formationId`, `dateInscription`, `montant`, `methodePaiement`, `numeroTelephone`, `statutPaiement`, `referencePaiement`, `createdAt`, `updatedAt`, `statut`, `motifRejet`) VALUES
(1, 23, 1, '2026-01-29 10:05:22', NULL, NULL, NULL, 'paye', NULL, '2026-01-29 10:05:22', '2026-02-16 23:48:41', 'validee', NULL),
(2, 23, 2, '2026-01-29 10:05:22', NULL, NULL, NULL, 'en_attente', NULL, '2026-01-29 10:05:22', '2026-02-16 10:26:57', 'validee', NULL),
(3, 18, 1, '2026-02-04 06:30:27', 500000.00, 'mobile', NULL, 'paye', 'PAY-1770186627651-18-1', '2026-02-04 06:30:27', '2026-02-16 10:26:11', 'validee', NULL),
(4, 1, 1, '2026-02-12 00:31:30', 450000.00, 'mobile', NULL, 'en_attente', NULL, '0000-00-00 00:00:00', '2026-02-16 10:26:20', 'validee', NULL),
(5, 1, 1, '2026-02-12 00:48:23', 450000.00, 'mobile', NULL, 'en_attente', NULL, '0000-00-00 00:00:00', '2026-02-20 15:16:50', 'validee', NULL),
(6, 18, 2, '2026-02-20 11:52:29', 1000000.00, 'classic', NULL, 'en_attente', 'PAY-1771588349523-18-2', '2026-02-20 11:52:29', '2026-02-20 14:22:02', 'validee', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `senderId` int(11) NOT NULL,
  `receiverId` int(11) NOT NULL,
  `content` text NOT NULL,
  `read` tinyint(1) DEFAULT 0,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `messages`
--

INSERT INTO `messages` (`id`, `senderId`, `receiverId`, `content`, `read`, `createdAt`, `updatedAt`) VALUES
(1, 2, 20, ',;,;,;;', 0, '2026-01-28 16:28:14', '2026-01-28 16:28:14'),
(2, 2, 20, 'basta', 0, '2026-01-28 16:28:25', '2026-01-28 16:28:25'),
(3, 2, 20, 'cfsfg', 0, '2026-02-19 22:38:25', '2026-02-19 22:38:25'),
(4, 22, 26, 'salut ', 0, '2026-02-20 13:36:53', '2026-02-20 13:36:53'),
(5, 2, 22, 'bonsoir dupont ', 1, '2026-02-20 15:17:31', '2026-02-23 19:53:55'),
(6, 22, 2, 'Bonsoir Admin', 0, '2026-02-23 19:54:16', '2026-02-23 19:54:16'),
(7, 2, 22, 'ça va dupont ', 1, '2026-02-23 19:59:22', '2026-02-23 20:00:18'),
(8, 22, 31, 'Bonjour Rudi', 0, '2026-02-25 10:00:56', '2026-02-25 10:00:56');

-- --------------------------------------------------------

--
-- Structure de la table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `message` varchar(255) NOT NULL,
  `lue` tinyint(1) DEFAULT 0,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `userId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `notifications`
--

INSERT INTO `notifications` (`id`, `message`, `lue`, `createdAt`, `updatedAt`, `userId`) VALUES
(0, 'Félicitations ! Votre compte formateur a été validé. Votre code d\'accès est: CFP-4761', 1, '2026-02-25 18:41:42', '2026-02-25 18:43:51', 0),
(1, 'Votre inscription à la formation \"Charpente Navale\" a été validée avec succès.', 1, '2026-02-16 10:26:11', '2026-02-23 20:11:59', 18),
(2, 'Votre inscription à la formation \"Charpente Navale\" a été validée avec succès.', 0, '2026-02-16 10:26:20', '2026-02-16 10:26:20', 1),
(3, 'Votre inscription à la formation \"Mécanique Marine\" a été validée avec succès.', 0, '2026-02-16 10:26:57', '2026-02-16 10:26:57', 23),
(4, 'Félicitations ! Votre compte formateur a été validé. Votre code d\'accès est: CFP-5754', 0, '2026-02-16 23:38:17', '2026-02-16 23:38:17', 27),
(5, 'Votre inscription à la formation \"Charpente Navale\" a été validée avec succès.', 0, '2026-02-16 23:48:41', '2026-02-16 23:48:41', 23),
(6, 'Nouveau formateur inscrit: Rogers Morgan (toussaintbenjamin14@gmail.com)', 1, '2026-02-16 23:51:44', '2026-02-23 19:36:49', NULL),
(7, 'Félicitations ! Votre compte formateur a été validé. Votre code d\'accès est: CFP-8850', 0, '2026-02-16 23:53:14', '2026-02-16 23:53:14', 28),
(8, 'Nouvelle inscription à \"Mécanique Marine\" par Rateloson Tahina (tahina@gmail.com).', 0, '2026-02-20 11:52:29', '2026-02-20 11:52:29', 1),
(9, 'Nouvelle inscription à \"Mécanique Marine\" par Rateloson Tahina (tahina@gmail.com).', 0, '2026-02-20 11:52:29', '2026-02-20 11:52:29', 2),
(10, 'Nouvelle inscription à \"Mécanique Marine\" par Rateloson Tahina (tahina@gmail.com).', 0, '2026-02-20 11:52:29', '2026-02-20 11:52:29', 21),
(11, 'Nouvelle inscription à \"Mécanique Marine\" par Rateloson Tahina (tahina@gmail.com).', 0, '2026-02-20 11:52:29', '2026-02-20 11:52:29', 26),
(12, 'Votre inscription à la formation \"Mécanique Marine\" a été validée avec succès.', 1, '2026-02-20 14:22:02', '2026-02-23 20:11:59', 18),
(13, 'Votre inscription à la formation \"Charpente Navale\" a été validée avec succès.', 0, '2026-02-20 15:16:50', '2026-02-20 15:16:50', 1),
(14, 'Nouvel étudiant inscrit en attente de validation: Benjamin Oscar (toussaintbenjamin108@gmail.com)', 1, '2026-02-23 07:46:08', '2026-02-23 19:36:47', NULL),
(15, 'Nouvel étudiant inscrit en attente de validation: Wawa Atsika (andryrakotonirina01@gmail.com)', 1, '2026-02-23 08:34:45', '2026-02-23 19:36:37', NULL),
(16, 'Félicitations ! Votre compte formateur a été validé. Votre code d\'accès est: CFP-3737', 0, '2026-02-23 19:32:29', '2026-02-23 19:32:29', 27),
(17, 'Nouveau formateur inscrit: Maes Rkt (rktmaes3@gmail.com)', 0, '2026-02-23 21:01:30', '2026-02-23 21:01:30', NULL),
(18, 'Félicitations ! Votre compte formateur a été validé. Votre code d\'accès est: CFP-1707', 0, '2026-02-23 21:02:20', '2026-02-23 21:02:20', 31),
(19, 'Félicitations ! Votre compte formateur a été validé. Votre code d\'accès est: CFP-6088', 0, '2026-02-23 21:12:14', '2026-02-23 21:12:14', 12),
(20, 'Nouvel étudiant inscrit en attente de validation: bob Oscar (rakotoarimanana01@gmail.com)', 1, '2026-02-23 21:17:45', '2026-02-25 09:06:26', NULL),
(21, 'Félicitations ! Votre compte formateur a été validé. Votre code d\'accès est: CFP-7585', 0, '2026-02-23 21:32:49', '2026-02-23 21:32:49', 31),
(22, 'Félicitations ! Votre compte formateur a été validé. Votre code d\'accès est: CFP-2486', 0, '2026-02-25 08:58:00', '2026-02-25 08:58:00', 31),
(23, 'Félicitations ! Votre compte formateur a été validé. Votre code d\'accès est: CFP-1347', 0, '2026-02-25 08:58:06', '2026-02-25 08:58:06', 31),
(24, 'Félicitations ! Votre compte formateur a été validé. Votre code d\'accès est: CFP-1820', 0, '2026-02-25 09:07:15', '2026-02-25 09:07:15', 33),
(25, 'Nouveau formateur inscrit: Test Formateur (formateur1772010972738@gmail.com)', 1, '2026-02-25 09:16:13', '2026-02-25 18:47:18', NULL),
(26, 'Félicitations ! Votre compte formateur a été validé. Votre code d\'accès est: CFP-3526', 0, '2026-02-25 09:16:18', '2026-02-25 09:16:18', 34);

-- --------------------------------------------------------

--
-- Structure de la table `notifications_absences`
--

CREATE TABLE `notifications_absences` (
  `id` int(11) NOT NULL,
  `type_notification` enum('conge_demande','permission_demande','conge_approuve','permission_approuve','conge_refuse','permission_refuse','conge_debut','permission_debut','conge_fin','permission_fin') NOT NULL,
  `user_id` int(11) NOT NULL,
  `user_name` varchar(255) NOT NULL,
  `user_email` varchar(255) NOT NULL,
  `user_role` enum('admin','formateur','apprenant') NOT NULL,
  `entite_type` enum('conge','permission') NOT NULL,
  `entite_id` int(11) NOT NULL,
  `titre` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `lu` tinyint(1) DEFAULT 0,
  `date_lecture` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `paiements`
--

CREATE TABLE `paiements` (
  `id` int(11) NOT NULL,
  `inscriptionId` int(11) DEFAULT NULL,
  `datePaiement` datetime DEFAULT NULL,
  `montant` decimal(10,2) DEFAULT NULL,
  `methodePaiement` varchar(255) DEFAULT NULL,
  `statut` varchar(255) DEFAULT NULL,
  `transactionId` varchar(255) DEFAULT NULL,
  `operateur` varchar(255) DEFAULT NULL,
  `numeroTelephone` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `permissions`
--

CREATE TABLE `permissions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `user_name` varchar(255) NOT NULL,
  `user_email` varchar(255) NOT NULL,
  `user_role` enum('admin','formateur','apprenant') NOT NULL,
  `type_permission` enum('personnel','professionnel','exceptionnel') NOT NULL,
  `date_permission` date NOT NULL,
  `heure_debut` time NOT NULL,
  `heure_fin` time NOT NULL,
  `duree` decimal(4,2) NOT NULL,
  `jours_demandes` decimal(3,1) NOT NULL,
  `motif` text NOT NULL,
  `retour_prevu` time DEFAULT NULL,
  `contact_urgence` varchar(255) DEFAULT NULL,
  `telephone_urgence` varchar(50) DEFAULT NULL,
  `statut` enum('en_attente','approuve','refuse','en_cours') DEFAULT 'en_attente',
  `date_demande` datetime NOT NULL DEFAULT current_timestamp(),
  `date_validation` datetime DEFAULT NULL,
  `validateur_id` int(11) DEFAULT NULL,
  `validateur_name` varchar(255) DEFAULT NULL,
  `motif_refus` text DEFAULT NULL,
  `documents` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`documents`)),
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déclencheurs `permissions`
--
DELIMITER $$
CREATE TRIGGER `update_permissions_stats_on_insert` AFTER INSERT ON `permissions` FOR EACH ROW BEGIN
    INSERT INTO conges_stats (user_id, user_name, user_role, annee, mois)
    VALUES (NEW.user_id, NEW.user_name, NEW.user_role, YEAR(NEW.date_permission), MONTH(NEW.date_permission))
    ON DUPLICATE KEY UPDATE
        permissions_en_attente = permissions_en_attente + 1,
        updated_at = CURRENT_TIMESTAMP;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `update_permissions_stats_on_update` AFTER UPDATE ON `permissions` FOR EACH ROW BEGIN
    -- Si le statut change de en_attente à approuve
    IF OLD.statut = 'en_attente' AND NEW.statut = 'approuve' THEN
        UPDATE conges_stats 
        SET 
            permissions_en_attente = permissions_en_attente - 1,
            heures_prises_mois = heures_prises_mois + NEW.duree,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = NEW.user_id 
        AND annee = YEAR(NEW.date_permission) 
        AND mois = MONTH(NEW.date_permission);
    
    -- Si le statut change de approuve à refuse
    ELSEIF OLD.statut = 'approuve' AND NEW.statut = 'refuse' THEN
        UPDATE conges_stats 
        SET 
            heures_prises_mois = GREATEST(0, heures_prises_mois - NEW.duree),
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = NEW.user_id 
        AND annee = YEAR(NEW.date_permission) 
        AND mois = MONTH(NEW.date_permission);
    
    -- Si le statut change de en_attente à refuse
    ELSEIF OLD.statut = 'en_attente' AND NEW.statut = 'refuse' THEN
        UPDATE conges_stats 
        SET 
            permissions_en_attente = permissions_en_attente - 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = NEW.user_id 
        AND annee = YEAR(NEW.date_permission) 
        AND mois = MONTH(NEW.date_permission);
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `presences`
--

CREATE TABLE `presences` (
  `id` int(11) NOT NULL,
  `coursId` int(11) DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  `statut` varchar(255) DEFAULT 'absent',
  `date` datetime DEFAULT NULL,
  `remarque` text DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `nom` varchar(255) NOT NULL,
  `prenom` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','formateur','apprenant') DEFAULT 'apprenant',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `statut` enum('actif','inactif','en_attente','valide','refuse','rejete') DEFAULT 'en_attente',
  `telephone` varchar(255) DEFAULT NULL,
  `adresse` varchar(255) DEFAULT NULL,
  `dateNaissance` datetime DEFAULT NULL,
  `codeFormateur` varchar(255) DEFAULT NULL COMMENT 'Code spécial pour les formateurs validés par admin',
  `photo` varchar(255) DEFAULT NULL COMMENT 'URL de la photo de profil',
  `emailVerified` tinyint(1) NOT NULL DEFAULT 0,
  `emailVerificationCode` varchar(32) DEFAULT NULL,
  `emailVerificationExpires` datetime DEFAULT NULL,
  `googleId` varchar(255) DEFAULT NULL,
  `googleAccessToken` text DEFAULT NULL,
  `googleRefreshToken` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `nom`, `prenom`, `email`, `password`, `role`, `createdAt`, `updatedAt`, `statut`, `telephone`, `adresse`, `dateNaissance`, `codeFormateur`, `photo`, `emailVerified`, `emailVerificationCode`, `emailVerificationExpires`, `googleId`, `googleAccessToken`, `googleRefreshToken`) VALUES
(1, 'Admin', 'Système', 'admin@cfp.com', '$2a$10$LcWN0vvgvPGXaUzwdzG1M.YrimqAPr/M7sZ5yMGaAWoAlbDMon66G', 'admin', '2026-01-16 14:02:20', '2026-01-23 06:11:20', 'actif', NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(2, 'Benjamin', '', 'benjamin@gmail.com', '$2a$10$X9M.vyUFIBsMSC2oj3rbM.d4yqSWEzELEt1X/eW1R/TzM.7OdsHzm', 'admin', '2026-01-16 14:25:39', '2026-02-16 10:12:16', 'actif', NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(3, 'basta ', '', 'basta@gmail.com', '$2a$10$yoeZlcadIrrPEpPt.moiIuqqwmLzepkEurV15zniDTwPoc0vtYeSK', 'apprenant', '2026-01-16 14:38:43', '2026-01-20 09:30:54', 'valide', NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(4, 'Toussaint', '', 'toussaint@gmail.com', '$2a$10$2IgAiQp8giRvDGD2iLvPteeJbRpIkQSlumSgkETlc1ITD13Bz.Zte', 'formateur', '2026-01-16 14:40:15', '2026-01-16 14:40:15', 'actif', NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(5, 'Yasmine', '', 'yasmine@gmail.com', '$2a$10$U8VkxNeHVwoiyODxFCx5fOP4mqbZhOQ3Z/gmRAuH3v389gB/iUAoG', 'formateur', '2026-01-16 14:57:40', '2026-01-16 14:57:40', 'actif', NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(6, 'Leo', '', 'leo@gmail.com', '$2a$10$sZw0m8dsjbWftTG2ng7AMu.sjSv/Q6A9zriNSK5waPkasgT2IX77u', 'apprenant', '2026-01-16 15:11:18', '2026-01-20 09:31:52', 'valide', NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(7, 'Mahefa', '', 'Mahefa@gmail.com', '$2a$10$QrGQQy9IKjoaywVIqTVo1unWodfHFBMi8v3W33.Tx/a3P064hNmAa', 'apprenant', '2026-01-19 09:31:57', '2026-01-28 09:01:10', 'valide', NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(8, 'Nayma ', '', 'Nayma@gmail.com', '$2a$10$ZaFvmL1UpsdM7PG9u8HG1O.n6A/MMlZoVuR0Jkfxd3Htvf7OgDhOC', 'apprenant', '2026-01-20 09:30:16', '2026-01-23 09:20:05', 'valide', NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(9, 'Jackmee', '', 'Jackmee@gmail.com', '$2a$10$iiYEpQ5uj8eqT14cpq6j1ucnbI6wXY931yXIyM/9L4.J4NR9.6UQW', 'formateur', '2026-01-20 09:33:56', '2026-01-20 09:33:56', 'valide', NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(10, 'Florio', '', 'florio@gmail.com', '$2a$10$lSMmz4ExRWQ.pHL/c34pyuNeRHxURxEKJ3as/9BEX3m4TzCGBIVY6', 'formateur', '2026-01-20 10:18:22', '2026-01-20 10:18:22', 'valide', NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(11, 'Maria ', '', 'maria@gmail.com', '$2a$10$cfAvvwlBj00LiVha1uo3lem4gFnEhHqjusSO.pWY.RM1um/yzXoEe', 'formateur', '2026-01-20 11:18:22', '2026-01-20 11:18:22', 'valide', NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(12, 'Ben', 'Lion', 'Ben@gmail.com', '$2a$10$QSDl8m5mHUYYquuRYC63g.fOVdxvY/5/ko2IEq7ASVPN8/ZbPo1Xe', 'formateur', '2026-01-23 06:13:36', '2026-02-23 21:12:14', 'valide', NULL, NULL, NULL, 'CFP-6088', NULL, 1, NULL, NULL, NULL, NULL, NULL),
(13, 'bakoko ', 'Aina', 'Aina@gmail.com', '$2a$10$ag6Ss/kr41U/c.6QtEg2mevy/CZf5.PEo1Zbnt6tQaDGZDYfOyuIa', 'apprenant', '2026-01-23 06:41:27', '2026-01-23 06:50:17', 'valide', NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(14, 'Dollar', 'Euro', 'Euro@gmail.com', '$2a$10$tuigWpbL6s21dxZ5e4dn4.MOgmtjTLEyHa9bkrsYI/YuZ1oILq0ay', 'formateur', '2026-01-23 06:52:18', '2026-01-23 07:14:04', 'valide', NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(15, 'Gang', 'Rich', 'rich@gmail.com', '$2a$10$rlI7dlWYiuvLOrFdr7YejObWqp13PoTAnb2p8lCvOURlKcgzH5FLa', 'formateur', '2026-01-23 07:10:20', '2026-01-23 07:11:23', 'valide', NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(16, 'Lion', 'Basta', 'Lbasta@gmail.com', '$2a$10$OOFbV.MpZjAl0rHJAbVxauFHcK1lBpdIIYrztk89qas9Kxsl1FAYy', 'formateur', '2026-01-23 07:38:20', '2026-01-23 07:43:48', 'valide', NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(17, 'Mena', 'Rakoto', 'rakoto@gmail.com', '$2a$10$kOmP52wLXvQsgE0OBE7RFuU92QfFJOGAgki167RLTozl9I0XdpEe6', 'formateur', '2026-01-23 09:21:46', '2026-01-23 09:23:52', 'valide', NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(18, 'Rateloson', 'Tahina', 'tahina@gmail.com', '$2a$10$n2wBvcH3Oec.waWt4yKmLe4ADvkhqvZn1O82AzXo6ALRpDd.P1deC', 'apprenant', '2026-01-23 13:00:52', '2026-01-23 13:01:21', 'valide', NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(19, 'Balita', 'Boom', 'boom@gmail.com', '$2a$10$Kj.sE67uZL2tzxYs8V9MY.CO/.F6apeCpf1Awuf5sVMl1Lh78m9Ia', 'formateur', '2026-01-23 13:03:43', '2026-01-23 13:03:43', 'actif', NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(20, 'Bidy', 'Tazy', 'bidy@gmail.com', '$2a$10$3Gdrfr07sug/dsr.vQoPcOiP5oSRQvk5YuYmW13z.pzZ418R71B4m', 'formateur', '2026-01-28 12:09:36', '2026-01-28 12:11:50', 'valide', NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(21, 'Admin', 'Principal', 'admin@test.com', '$2a$10$VkLzPHJjkSjm8BonopVM/OJyuq75OjDoAZsL3ErQp9q5.wWQkd3gi', 'admin', '2026-01-29 10:05:21', '2026-01-29 10:05:21', 'valide', NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(22, 'Dupont', 'Jean', 'formateur@test.com', '$2a$10$CXUw/ckHORPS3TbGzjc52eIKJGRjrXNbEoEz.gFMFmz.fip3y90gG', 'formateur', '2026-01-29 10:05:21', '2026-01-29 11:17:21', 'valide', NULL, NULL, NULL, 'CFP-1234', NULL, 0, NULL, NULL, NULL, NULL, NULL),
(23, 'Martin', 'Alice', 'apprenant@test.com', '$2a$10$i44mdqO2.gsUiHrpO8GyhuiCaXENGiFb6ZJEMgUVYOxCYyIuGF5Ju', 'apprenant', '2026-01-29 10:05:22', '2026-01-29 10:05:22', 'valide', NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(24, 'Durand', 'Pierre', 'apprenant.attente@test.com', '$2a$10$WVSb.1H75QoaITuDZSefDuF.GbIvrLquc115tKnuA/74YTIcZS9ca', 'apprenant', '2026-01-29 10:05:22', '2026-01-29 10:05:22', 'actif', NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(25, 'Toussaint', 'Benjamin', 'bonga@gmail.com', '$2a$10$0s4dN4T6oVc2V4FSaGNVweSL2wdCdfnHNAy4GIKpePd4exM3p4HU2', 'apprenant', '2026-02-06 16:37:48', '2026-02-23 07:38:00', 'valide', NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(26, 'RAKOTOARIMANANA', 'Mahefatahiana', 'mahefarakotoarimanana01@gmail.com', '$2a$10$0DV8iPOXNOu.BeNDhFRRb.sc5B3SnxFfz8snozAOa2IoJlLuGuoqm', 'admin', '2026-02-06 17:34:06', '2026-02-06 17:34:06', 'valide', NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(27, 'Juliano', 'Njl', 'njl@gmail.com', '$2a$10$xZZ89m0Y3TE5j2FG.MrNuOYSX5nesZoqvy4XNb8KpkmHZIO6W.jwS', 'formateur', '2026-02-13 23:38:38', '2026-02-23 19:32:29', 'valide', '+261328405886', 'Manjarisoa', NULL, 'CFP-3737', '/uploads/photo-1771015118073-539097787.png', 1, NULL, NULL, NULL, NULL, NULL),
(28, 'Rogers', 'Morgan', 'toussaintbenjamin14@gmail.com', '$2a$10$T.nzl/BvRJDc0kCirM6Xm.6Rh/BydIBq068J/JPs1PXmuSOTWEN9e', 'formateur', '2026-02-16 23:51:44', '2026-02-23 19:01:26', 'valide', '0329046270', 'Ambalavola', NULL, 'CFP-8850', NULL, 1, NULL, NULL, '108176949110475661903', 'ya29.A0ATkoCc79rqT3PF6mFuGuSb9TRS-gVkwdwLjJHI8WAlFu0BYprvca1lNYvvcdSEi-RBjqlgnBO6lPRv-C_eBcq4ZrIQb8ZONz-_JOKQ68FbLnJsI8I1Bxl_qoLc_qdj-WURgyj1VO5Lr6yuYDVUglDCbOJQDcfL-tC_OFLQnXUjn7LrN35DZ-8KOls07rFND9wg_e1CkxjodhZiakkl1mcYHPWrK1mbZj2awfKwX0WT-J8xw32LgTlDoV2K-wi_Z3-LDPeBGNugwFVzoYaIuYh6zmogaCgYKAcYSARISFQHGX2Mi3muqLo69U_qqPRx_6zUW0A0289', NULL),
(29, 'Benjamin', 'Oscar', 'toussaintbenjamin108@gmail.com', '$2a$10$rfNp9sjOiplFvrzghHuhd.C9W1irNHrOisEvDhM.6LdWNU6VAAn/2', 'apprenant', '2026-02-23 07:46:08', '2026-02-23 18:58:44', 'valide', '0329046270', 'Ambalavola', NULL, NULL, NULL, 1, NULL, NULL, '118128012915471253663', 'ya29.A0ATkoCc5sYGwx8yrLQLQIAVM-tQLmtMAZ8e16ni0MXdt9W5j6ZNaXzzixu1ja_iJMS504_Mdcsrkd1_X5Uwhj8PJS6dVEMC72hQaohohZvotmYSVUeh9Domzf6C-mCpuw4LzCWJ_5g0NwOunSUhr2B6KogtRyVRJbjmzmLYDg6yIxHC4hBSMtlorJ-KWh0tM9-ryviOwUU8ei-hl1MkpCe4Y6-50rz_6j7JSHdBdzcAH2NAI37meLtGuqn2nqipEXM0HNLS3Og-eQPCBMRJxJK-OvxVEaCgYKAWoSARYSFQHGX2MiStsmLtHF_xThCXR3oT1erA0290', NULL),
(31, 'Maes', 'Rkt', 'rktmaes3@gmail.com', '$2a$10$Tk3eoX7da7ecl4OzfTMPMOCpFSKetFrPczV3aigFc6lLogYRvoIHq', 'formateur', '2026-02-23 21:01:29', '2026-02-25 08:58:11', 'valide', '0347419132', 'Tsararano', NULL, 'CFP-1347', NULL, 1, '810294', '2026-02-23 21:31:30', NULL, NULL, NULL),
(32, 'bob', 'Oscar', 'rakotoarimanana01@gmail.com', '$2a$10$qrQLLVr/cU37P0RsKLNX..T/O6jNoOYQX0EGMyd3lUi3Pcqnv0Njm', 'apprenant', '2026-02-23 21:17:45', '2026-02-23 21:19:07', 'valide', '0328605886', 'Ambony', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL),
(33, 'Rudi', 'Severin', 'severinrudi8@gmail.com', 'xqebcmay', 'formateur', '2026-02-25 09:05:58', '2026-02-25 09:35:01', 'valide', NULL, NULL, NULL, 'CFP-1820', NULL, 1, NULL, NULL, '113001504880978818940', 'ya29.A0ATkoCc7xzf3sTkKZEd6zMVz3OPvg8ihwSy44yeb3H6BGSqjb_bQAHHrPeVUrSq-TFWFVUHajyNfWXso812U8zMju7X-2KwYdI35i20hyAy2H_6-wWBVT85F9ILzRgqXAuStZHaiq8DEtyFKrhtkexfBBgfiG5t8cFD_b7TCHihhz4WXpAwZK8vYjlUNCC_1nqLja_wCh1-a_ivHQGB1ikdgGAnqC8TB5F0-h5FtElzungc27Vx-FBbGlpWbZioHdBGlR0zkt3JC9Yb4EMBd56LtySLcpaCgYKAVQSARMSFQHGX2MiCHh1puCAta0Uroxyk4c58w0291', NULL),
(34, 'Test', 'Formateur', 'formateur1772010972738@gmail.com', '$2a$10$OZeKD.dHQLptHoWjWSP8p.5JFxIJIJRU58IS7xC7nj6x.rXamDQxW', 'formateur', '2026-02-25 09:16:12', '2026-02-25 09:16:24', 'valide', NULL, NULL, NULL, 'CFP-3526', NULL, 1, '288200', '2026-02-25 09:46:13', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `v_conges_actifs`
-- (Voir ci-dessous la vue réelle)
--
CREATE TABLE `v_conges_actifs` (
`id` int(11)
,`user_id` int(11)
,`user_name` varchar(255)
,`user_email` varchar(255)
,`user_role` enum('admin','formateur','apprenant')
,`type_conge` enum('annuel','maladie','maternite','exceptionnel')
,`date_debut` date
,`date_fin` date
,`jours_demandes` int(11)
,`motif` text
,`contact_urgence` varchar(255)
,`telephone_urgence` varchar(50)
,`statut` enum('en_attente','approuve','refuse','en_cours')
,`date_demande` datetime
,`date_validation` datetime
,`validateur_id` int(11)
,`validateur_name` varchar(255)
,`motif_refus` text
,`documents` longtext
,`created_at` datetime
,`updated_at` datetime
,`user_email_original` varchar(255)
,`statut_calculé` varchar(15)
,`duree_calculee` int(8)
);

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `v_permissions_aujourdhui`
-- (Voir ci-dessous la vue réelle)
--
CREATE TABLE `v_permissions_aujourdhui` (
`id` int(11)
,`user_id` int(11)
,`user_name` varchar(255)
,`user_email` varchar(255)
,`user_role` enum('admin','formateur','apprenant')
,`type_permission` enum('personnel','professionnel','exceptionnel')
,`date_permission` date
,`heure_debut` time
,`heure_fin` time
,`duree` decimal(4,2)
,`jours_demandes` decimal(3,1)
,`motif` text
,`retour_prevu` time
,`contact_urgence` varchar(255)
,`telephone_urgence` varchar(50)
,`statut` enum('en_attente','approuve','refuse','en_cours')
,`date_demande` datetime
,`date_validation` datetime
,`validateur_id` int(11)
,`validateur_name` varchar(255)
,`motif_refus` text
,`documents` longtext
,`created_at` datetime
,`updated_at` datetime
,`user_email_original` varchar(255)
,`statut_calculé` varchar(17)
,`duree_calculee` time
);

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `v_stats_globales`
-- (Voir ci-dessous la vue réelle)
--
CREATE TABLE `v_stats_globales` (
`type` varchar(11)
,`total` bigint(21)
,`en_attente` decimal(22,0)
,`approuves` decimal(22,0)
,`refuses` decimal(22,0)
,`en_cours` decimal(22,0)
,`total_jours` decimal(33,1)
);

-- --------------------------------------------------------

--
-- Structure de la vue `v_conges_actifs`
--
DROP TABLE IF EXISTS `v_conges_actifs`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_conges_actifs`  AS SELECT `c`.`id` AS `id`, `c`.`user_id` AS `user_id`, `c`.`user_name` AS `user_name`, `c`.`user_email` AS `user_email`, `c`.`user_role` AS `user_role`, `c`.`type_conge` AS `type_conge`, `c`.`date_debut` AS `date_debut`, `c`.`date_fin` AS `date_fin`, `c`.`jours_demandes` AS `jours_demandes`, `c`.`motif` AS `motif`, `c`.`contact_urgence` AS `contact_urgence`, `c`.`telephone_urgence` AS `telephone_urgence`, `c`.`statut` AS `statut`, `c`.`date_demande` AS `date_demande`, `c`.`date_validation` AS `date_validation`, `c`.`validateur_id` AS `validateur_id`, `c`.`validateur_name` AS `validateur_name`, `c`.`motif_refus` AS `motif_refus`, `c`.`documents` AS `documents`, `c`.`created_at` AS `created_at`, `c`.`updated_at` AS `updated_at`, `u`.`email` AS `user_email_original`, CASE WHEN curdate() between `c`.`date_debut` and `c`.`date_fin` AND `c`.`statut` = 'en_cours' THEN 'en_cours_actuel' WHEN curdate() < `c`.`date_debut` AND `c`.`statut` in ('approuve','en_cours') THEN 'a_venir' WHEN curdate() > `c`.`date_fin` AND `c`.`statut` in ('approuve','en_cours') THEN 'termine' ELSE `c`.`statut` END AS `statut_calculé`, to_days(`c`.`date_fin`) - to_days(`c`.`date_debut`) + 1 AS `duree_calculee` FROM (`conges` `c` left join `users` `u` on(`c`.`user_id` = `u`.`id`)) WHERE `c`.`statut` in ('approuve','en_cours') ;

-- --------------------------------------------------------

--
-- Structure de la vue `v_permissions_aujourdhui`
--
DROP TABLE IF EXISTS `v_permissions_aujourdhui`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_permissions_aujourdhui`  AS SELECT `p`.`id` AS `id`, `p`.`user_id` AS `user_id`, `p`.`user_name` AS `user_name`, `p`.`user_email` AS `user_email`, `p`.`user_role` AS `user_role`, `p`.`type_permission` AS `type_permission`, `p`.`date_permission` AS `date_permission`, `p`.`heure_debut` AS `heure_debut`, `p`.`heure_fin` AS `heure_fin`, `p`.`duree` AS `duree`, `p`.`jours_demandes` AS `jours_demandes`, `p`.`motif` AS `motif`, `p`.`retour_prevu` AS `retour_prevu`, `p`.`contact_urgence` AS `contact_urgence`, `p`.`telephone_urgence` AS `telephone_urgence`, `p`.`statut` AS `statut`, `p`.`date_demande` AS `date_demande`, `p`.`date_validation` AS `date_validation`, `p`.`validateur_id` AS `validateur_id`, `p`.`validateur_name` AS `validateur_name`, `p`.`motif_refus` AS `motif_refus`, `p`.`documents` AS `documents`, `p`.`created_at` AS `created_at`, `p`.`updated_at` AS `updated_at`, `u`.`email` AS `user_email_original`, CASE WHEN cast(`p`.`date_permission` as date) = curdate() AND cast(current_timestamp() as time) between `p`.`heure_debut` and `p`.`heure_fin` AND `p`.`statut` = 'en_cours' THEN 'en_cours_actuelle' WHEN cast(`p`.`date_permission` as date) = curdate() AND `p`.`statut` in ('approuve','en_cours') THEN 'aujourdhui' ELSE `p`.`statut` END AS `statut_calculé`, timediff(`p`.`heure_fin`,`p`.`heure_debut`) AS `duree_calculee` FROM (`permissions` `p` left join `users` `u` on(`p`.`user_id` = `u`.`id`)) WHERE cast(`p`.`date_permission` as date) = curdate() AND `p`.`statut` in ('approuve','en_cours') ;

-- --------------------------------------------------------

--
-- Structure de la vue `v_stats_globales`
--
DROP TABLE IF EXISTS `v_stats_globales`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_stats_globales`  AS SELECT 'conges' AS `type`, count(0) AS `total`, sum(case when `conges`.`statut` = 'en_attente' then 1 else 0 end) AS `en_attente`, sum(case when `conges`.`statut` = 'approuve' then 1 else 0 end) AS `approuves`, sum(case when `conges`.`statut` = 'refuse' then 1 else 0 end) AS `refuses`, sum(case when `conges`.`statut` = 'en_cours' then 1 else 0 end) AS `en_cours`, sum(`conges`.`jours_demandes`) AS `total_jours` FROM `conges` WHERE year(`conges`.`date_debut`) = year(current_timestamp())union all select 'permissions' AS `type`,count(0) AS `total`,sum(case when `permissions`.`statut` = 'en_attente' then 1 else 0 end) AS `en_attente`,sum(case when `permissions`.`statut` = 'approuve' then 1 else 0 end) AS `approuves`,sum(case when `permissions`.`statut` = 'refuse' then 1 else 0 end) AS `refuses`,sum(case when `permissions`.`statut` = 'en_cours' then 1 else 0 end) AS `en_cours`,sum(`permissions`.`jours_demandes`) AS `total_jours` from `permissions` where year(`permissions`.`date_permission`) = year(current_timestamp())  ;

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `annonces_apprenants`
--
ALTER TABLE `annonces_apprenants`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `annonces_formateurs`
--
ALTER TABLE `annonces_formateurs`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `ateliers`
--
ALTER TABLE `ateliers`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `conges`
--
ALTER TABLE `conges`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `conges_stats`
--
ALTER TABLE `conges_stats`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `cours`
--
ALTER TABLE `cours`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `formations`
--
ALTER TABLE `formations`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `inscriptions`
--
ALTER TABLE `inscriptions`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `notifications_absences`
--
ALTER TABLE `notifications_absences`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `paiements`
--
ALTER TABLE `paiements`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `presences`
--
ALTER TABLE `presences`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
