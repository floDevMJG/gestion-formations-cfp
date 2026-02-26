-- Script de diagnostic et insertion simple pour la table cours
-- Étape 1: Vérifiez si la table existe
SHOW TABLES LIKE 'cours';

-- Étape 2: Affichez la structure exacte de la table
DESCRIBE cours;

-- Étape 3: Test d'insertion simple (un seul cours)
INSERT INTO cours (titre, description, date, heureDebut, heureFin, salle, capacite, inscrits, type, statut, formateurId) 
VALUES (
    'Test Cours Ébénisterie',
    'Cours de test pour ébénisterie navale',
    '2024-02-20',
    '09:00',
    '12:00',
    'Atelier Test',
    10,
    5,
    'pratique',
    'actif',
    1
);

-- Étape 4: Vérification
SELECT * FROM cours WHERE titre LIKE 'Test%' ORDER BY id DESC LIMIT 1;

-- Si le test fonctionne, essayez les 3 cours complets :
INSERT INTO cours (titre, description, date, heureDebut, heureFin, salle, capacite, inscrits, type, statut, formateurId) 
VALUES 
('Cours Ébénisterie Navale', 'Techniques d''ébénisterie appliquées à la construction navale', '2024-02-20', '09:00', '13:00', 'Atelier Ébénisterie 201', 12, 8, 'pratique', 'actif', 1),
('Cours Cordage et Gréement', 'Fabrication et entretien des cordages et gréements traditionnels', '2024-02-25', '14:00', '17:30', 'Atelier Gréement 202', 16, 10, 'hybride', 'actif', 1),
('Cours Restauration de Bateaux Anciens', 'Techniques de restauration et conservation des bateaux anciens', '2024-03-01', '08:30', '12:30', 'Atelier Restauration 203', 10, 6, 'pratique', 'actif', 1);

-- Vérification finale
SELECT id, titre, date, heureDebut, heureFin, salle, capacite, inscrits, type, statut FROM cours WHERE formateurId = 1 ORDER BY date DESC;
