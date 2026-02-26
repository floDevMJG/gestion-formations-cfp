-- Script corrigé pour ajouter 3 nouveaux cours dans la table cours
-- Vérifiez d'abord la structure de votre table cours avec : DESCRIBE cours;

-- 1. Cours Ébénisterie Navale
INSERT INTO cours (
    titre, 
    description, 
    date, 
    heureDebut, 
    heureFin, 
    salle, 
    capacite, 
    inscrits, 
    type, 
    statut, 
    formateurId
) VALUES (
    'Cours Ébénisterie Navale',
    'Techniques d''ébénisterie appliquées à la construction navale : placages, marqueterie et finitions de luxe pour les aménagements intérieurs de yachts et bateaux de prestige',
    '2024-02-20',
    '09:00',
    '13:00',
    'Atelier Ébénisterie 201',
    12,
    8,
    'pratique',
    'actif',
    1
);

-- 2. Cours Cordage et Gréement
INSERT INTO cours (
    titre, 
    description, 
    date, 
    heureDebut, 
    heureFin, 
    salle, 
    capacite, 
    inscrits, 
    type, 
    statut, 
    formateurId
) VALUES (
    'Cours Cordage et Gréement',
    'Fabrication et entretien des cordages et gréements traditionnels : nœuds marins, épissures, et techniques de montage des voiles et équipements de pont',
    '2024-02-25',
    '14:00',
    '17:30',
    'Atelier Gréement 202',
    16,
    10,
    'hybride',
    'actif',
    1
);

-- 3. Cours Restauration de Bateaux Anciens
INSERT INTO cours (
    titre, 
    description, 
    date, 
    heureDebut, 
    heureFin, 
    salle, 
    capacite, 
    inscrits, 
    type, 
    statut, 
    formateurId
) VALUES (
    'Cours Restauration de Bateaux Anciens',
    'Techniques de restauration et conservation des bateaux anciens et classés : analyse structurelle, remplacement des pièces dégradées et respect des méthodes traditionnelles',
    '2024-03-01',
    '08:30',
    '12:30',
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
    heureDebut,
    heureFin,
    salle,
    capacite,
    inscrits,
    type,
    statut,
    LEFT(description, 50) as description_courte
FROM cours 
WHERE formateurId = 1
ORDER BY date DESC, heureDebut DESC;
