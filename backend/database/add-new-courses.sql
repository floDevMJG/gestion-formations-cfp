-- Ajout de 3 nouveaux cours dans la table ateliers
-- Copiez-collez ces requêtes dans votre base de données MySQL

-- 1. Atelier Ébénisterie Navale
INSERT INTO ateliers (
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
) VALUES (
    'Atelier Ébénisterie Navale',
    'Techniques d''ébénisterie appliquées à la construction navale : placages, marqueterie et finitions de luxe pour les aménagements intérieurs de yachts et bateaux de prestige',
    '2024-02-20',
    '09:00:00',
    '13:00:00',
    'Atelier Ébénisterie 201',
    12,
    8,
    'pratique',
    'actif',
    1
);

-- 2. Atelier Cordage et Gréement
INSERT INTO ateliers (
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
) VALUES (
    'Atelier Cordage et Gréement',
    'Fabrication et entretien des cordages et gréements traditionnels : nœuds marins, épissures, et techniques de montage des voiles et équipements de pont',
    '2024-02-25',
    '14:00:00',
    '17:30:00',
    'Atelier Gréement 202',
    16,
    10,
    'hybride',
    'actif',
    1
);

-- 3. Atelier Restauration de Bateaux Anciens
INSERT INTO ateliers (
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
) VALUES (
    'Atelier Restauration de Bateaux Anciens',
    'Techniques de restauration et conservation des bateaux anciens et classés : analyse structurelle, remplacement des pièces dégradées et respect des méthodes traditionnelles',
    '2024-03-01',
    '08:30:00',
    '12:30:00',
    'Atelier Restauration 203',
    10,
    6,
    'pratique',
    'actif',
    1
);

-- Vérification des nouveaux cours ajoutés
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
    statut,
    LEFT(description, 50) as description_courte
FROM ateliers 
WHERE formateur_id = 1
ORDER BY date DESC, heure_debut DESC;
