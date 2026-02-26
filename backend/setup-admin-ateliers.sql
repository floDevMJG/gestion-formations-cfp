-- Vérifier et ajouter les ateliers pour l'admin

-- 1. Vérifier si la table ateliers existe
SHOW TABLES LIKE 'ateliers';

-- 2. Vérifier combien d'ateliers existent
SELECT COUNT(*) as total_ateliers FROM ateliers;

-- 3. Afficher les ateliers existants
SELECT id, titre, date, statut FROM ateliers ORDER BY id;

-- 4. Si aucun atelier n'existe, ajouter les 3 ateliers de base
INSERT IGNORE INTO ateliers (
    titre, 
    description, 
    date, 
    heure_debut, 
    heure_fin, 
    salle, 
    capacite, 
    inscrits, 
    type, 
    statut, 
    formateur_id
) VALUES 
(
    'Atelier Charpente Marine Traditionnelle',
    'Apprentissage des techniques traditionnelles de charpenterie marine : assemblages, jointures et travail du bois pour la construction navale',
    '2024-02-15',
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
    'Maîtrise des techniques de construction de coques en bois : bordé, membrures et renforts pour bateaux traditionnels',
    '2024-02-18',
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
    'Techniques de vitrerie marine : pose de hublots, fenêtres et vitrages spécifiques pour les embarcations',
    '2024-02-22',
    '10:00:00',
    '13:00:00',
    'Atelier Naval 103',
    18,
    16,
    'pratique',
    'actif',
    1
);

-- 5. Vérifier le résultat final
SELECT COUNT(*) as total_final FROM ateliers;
SELECT id, titre, date, statut, formateur_id FROM ateliers ORDER BY id;
