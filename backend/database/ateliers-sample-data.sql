-- Exemple de données complètes pour tester l'application
-- Copiez-collez ces requêtes dans votre base de données MySQL

-- Nettoyage des données existantes (optionnel)
-- DELETE FROM ateliers WHERE formateur_id = 1;

-- Insertion d'ateliers de test pour le formateur avec ID = 1
INSERT INTO ateliers (titre, description, date, heure_debut, heure_fin, salle, capacite, inscrits, type, statut, formateur_id) VALUES
(
    'Atelier Charpente Marine Traditionnelle',
    'Apprentissage des techniques traditionnelles de charpenterie marine : assemblages, jointures et travail du bois pour la construction navale. Techniques de sciage, perçage et assemblage manuel.',
    '2024-01-15',
    '09:00:00',
    '12:00:00',
    'Atelier Naval 101',
    20,
    15,
    'pratique',
    'actif',
    1
),
(
    'Atelier Construction Coque en Bois',
    'Maîtrise des techniques de construction de coques en bois : bordé, membrures et renforts pour bateaux traditionnels. Étude des plans et mise en œuvre des pièces structurelles.',
    '2024-01-18',
    '14:00:00',
    '17:00:00',
    'Atelier Naval 102',
    15,
    12,
    'pratique',
    'actif',
    1
),
(
    'Atelier Vitrerie Marine',
    'Techniques de vitrerie marine : pose de hublots, fenêtres et vitrages spécifiques pour les embarcations. Étanchéité et résistance aux conditions maritimes.',
    '2024-01-22',
    '10:00:00',
    '13:00:00',
    'Atelier Naval 103',
    18,
    16,
    'pratique',
    'actif',
    1
),
(
    'Atelier Théorie du Navire',
    'Principes fondamentaux de la conception navale : hydrostatique, stabilité, flottabilité et calcul des structures. Introduction aux plans architecturaux maritimes.',
    '2024-01-25',
    '09:30:00',
    '12:30:00',
    'Salle Théorie 104',
    25,
    8,
    'theorique',
    'actif',
    1
),
(
    'Atelier Menuiserie Navale',
    'Techniques avancées de menuiserie pour les aménagements intérieurs de bateaux : placards, couchettes, tables et finitions bois marines.',
    '2024-01-28',
    '13:00:00',
    '16:00:00',
    'Atelier Naval 105',
    20,
    18,
    'hybride',
    'actif',
    1
),
(
    'Atelier Maintenance et Réparation',
    'Techniques de maintenance et réparation des structures en bois : détection de fissures, remplacement de pièces et traitement du bois contre l\'humidité.',
    '2024-02-01',
    '09:00:00',
    '12:00:00',
    'Atelier Maintenance 106',
    16,
    10,
    'pratique',
    'actif',
    1
),
(
    'Atelier Outillage et Sécurité',
    'Formation aux outils spécifiques de la charpenterie marine : scies, raboteuses, perceuses et équipements de sécurité. Normes et bonnes pratiques.',
    '2024-02-05',
    '14:00:00',
    '17:00:00',
    'Atelier Outils 107',
    15,
    6,
    'pratique',
    'actif',
    1
),
(
    'Atelier Traitement du Bois',
    'Techniques de traitement et protection du bois pour environnement maritime : vernis, peintures, antifouling et préservation contre les organismes marins.',
    '2024-02-08',
    '10:00:00',
    '13:00:00',
    'Atelier Traitement 108',
    20,
    14,
    'hybride',
    'actif',
    1
),
(
    'Atelier Lecture de Plans Navals',
    'Interprétation des plans techniques de construction navale : coupes, vues, cotations et symboles spécifiques à l\'industrie maritime.',
    '2024-02-12',
    '09:00:00',
    '12:00:00',
    'Sable Plans 109',
    18,
    9,
    'theorique',
    'actif',
    1
),
(
    'Atelier Assemblages Complexes',
    'Techniques d\'assemblages complexes pour la charpenterie marine : queues d\'aronde, tenons et mortaises, et joints spécifiques aux contraintes maritimes.',
    '2024-02-15',
    '14:00:00',
    '17:00:00',
    'Atelier Naval 110',
    22,
    11,
    'pratique',
    'actif',
    1
);

-- Ateliers terminés (pour tester les filtres)
INSERT INTO ateliers (titre, description, date, heure_debut, heure_fin, salle, capacite, inscrits, type, statut, formateur_id) VALUES
(
    'Atelier Bois et Matériaux Marins',
    'Identification et sélection des bois adaptés à l\'environnement maritime : chêne, teck, sapin et traitements spécifiques pour la durabilité.',
    '2023-12-01',
    '09:00:00',
    '12:00:00',
    'Atelier Matériaux 201',
    20,
    19,
    'pratique',
    'terminé',
    1
),
(
    'Atelier Calculs Navals',
    'Calculs mathématiques pour la construction navale : stabilité, centre de gravité, flottabilité et résistance des matériaux.',
    '2023-12-05',
    '14:00:00',
    '17:00:00',
    'Salle Calculs 202',
    25,
    22,
    'theorique',
    'terminé',
    1
);

-- Atelier annulé (pour tester les filtres)
INSERT INTO ateliers (titre, description, date, heure_debut, heure_fin, salle, capacite, inscrits, type, statut, formateur_id) VALUES
(
    'Atelier Construction Navale Avancée',
    'Techniques avancées de construction de coques complexes et superstructures pour navires de grande taille. Méthodes modernes et traditionnelles.',
    '2024-01-10',
    '10:00:00',
    '13:00:00',
    'Atelier Avancé 301',
    15,
    5,
    'theorique',
    'annulé',
    1
);

-- Vérification des données insérées
SELECT 
    id,
    titre,
    DATE_FORMAT(date, '%d/%m/%Y') as date_formatee,
    TIME_FORMAT(heure_debut, '%H:%i') as heure_debut_formatee,
    TIME_FORMAT(heure_fin, '%H:%i') as heure_fin_formatee,
    salle,
    capacite,
    inscrits,
    type,
    statut
FROM ateliers 
WHERE formateur_id = 1
ORDER BY date DESC, heure_debut DESC;
