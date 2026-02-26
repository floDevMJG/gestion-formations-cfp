-- Vérifiez d'abord la structure exacte de la table cours
DESCRIBE cours;

-- Vérifiez s'il y a des contraintes de clé étrangère
SHOW CREATE TABLE cours;

-- Test d'insertion simple pour identifier le problème exact
INSERT INTO cours (titre, description, date, heureDebut, heureFin, salle, type, statut, formateurId) 
VALUES ('Test Simple', 'Description test', '2024-02-20', '09:00', '11:00', 'Salle Test', 'pratique', 'actif', 1);

-- Si ça fonctionne, essayez avec plus de champs
INSERT INTO cours (titre, description, date, heureDebut, heureFin, salle, type, statut, formateurId) 
VALUES (
    'Cours Test Complet',
    'Description complète du cours de test pour vérifier tous les champs',
    '2024-02-21',
    '14:00',
    '17:00',
    'Atelier Test 2',
    'pratique',
    'actif',
    1
);

-- Vérification
SELECT * FROM cours WHERE titre LIKE '%Test%' ORDER BY id DESC;
