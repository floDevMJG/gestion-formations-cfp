-- Vérifiez la structure complète de la table cours
DESCRIBE cours;

-- Vérifiez s'il y a des colonnes formation et formateur
SHOW COLUMNS FROM cours LIKE '%formation%';
SHOW COLUMNS FROM cours LIKE '%formateur%';

-- Vérifiez les contraintes de clé étrangère
SELECT 
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM 
    INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE 
    TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'cours' 
    AND REFERENCED_TABLE_NAME IS NOT NULL;

-- Test d'insertion avec tous les champs possibles
-- Essayez d'abord avec les champs de base
INSERT INTO cours (titre, description, date, heureDebut, heureFin, salle, type, statut, formateurId) 
VALUES ('Test Complet', 'Test avec tous les champs', '2024-02-20', '09:00', '11:00', 'Salle Test', 'pratique', 'actif', 1);

-- Si ça fonctionne, essayez avec formationId si la colonne existe
-- INSERT INTO cours (titre, description, date, heureDebut, heureFin, salle, type, statut, formateurId, formationId) 
-- VALUES ('Test avec Formation', 'Test avec formation', '2024-02-20', '09:00', '11:00', 'Salle Test', 'pratique', 'actif', 1, 1);

-- Vérifiez les tables liées
SHOW TABLES LIKE '%formation%';
SHOW TABLES LIKE '%formateur%';
SHOW TABLES LIKE '%user%';
