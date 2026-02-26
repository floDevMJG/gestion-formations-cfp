-- Diagnostic complet de la table cours et des tables liées

-- 1. Vérifiez si la table cours existe
SHOW TABLES LIKE 'cours';

-- 2. Structure complète de la table cours
DESCRIBE cours;

-- 3. Vérifiez la création exacte de la table
SHOW CREATE TABLE cours;

-- 4. Vérifiez les tables liées (formations, users)
SHOW TABLES LIKE '%formation%';
SHOW TABLES LIKE '%user%';

-- 5. Structure des tables liées
DESCRIBE formations;
DESCRIBE users;

-- 6. Vérifiez s'il y a des données dans les tables liées
SELECT COUNT(*) as total_formations FROM formations;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_formateurs FROM users WHERE role = 'formateur';

-- 7. Test d'insertion avec valeurs fixes pour identifier l'erreur exacte
-- Essayez d'abord SANS formationId et formateurId
INSERT INTO cours (titre, description, date, heureDebut, heureFin, salle, type, statut, formateurId) 
VALUES ('Test 1', 'Test sans formationId', '2024-02-20', '09:00', '11:00', 'Salle 1', 'pratique', 'actif', 1);

-- 8. Si ça marche, essayez AVEC formationId (si la colonne existe)
-- INSERT INTO cours (titre, description, date, heureDebut, heureFin, salle, type, statut, formateurId, formationId) 
-- VALUES ('Test 2', 'Test avec formationId', '2024-02-20', '09:00', '11:00', 'Salle 2', 'pratique', 'actif', 1, 1);

-- 9. Vérifiez les données insérées
SELECT * FROM cours WHERE titre LIKE 'Test%' ORDER BY id DESC;

-- 10. Nettoyage des tests
-- DELETE FROM cours WHERE titre LIKE 'Test%';

-- 11. Vérifiez les contraintes de clé étrangère
SELECT 
    TABLE_NAME,
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
