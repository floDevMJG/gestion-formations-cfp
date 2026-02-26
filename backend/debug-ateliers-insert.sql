-- Diagnostic complet pour l'ajout d'ateliers

-- 1. Vérifier si la table ateliers existe
SHOW TABLES LIKE 'ateliers';

-- 2. Structure complète de la table ateliers
DESCRIBE ateliers;

-- 3. Vérifier la création exacte de la table
SHOW CREATE TABLE ateliers;

-- 4. Vérifier s'il y a des contraintes de clé étrangère
SELECT 
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM 
    INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE 
    TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'ateliers' 
    AND REFERENCED_TABLE_NAME IS NOT NULL;

-- 5. Vérifier les données existantes
SELECT COUNT(*) as total_ateliers FROM ateliers;
SELECT * FROM ateliers ORDER BY id DESC LIMIT 5;

-- 6. Test d'insertion manuel pour identifier l'erreur exacte
-- Essayez d'abord avec les valeurs minimales
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
    'Test Atelier Manuel',
    'Test insertion manuelle',
    '2024-02-15',
    '09:00:00',
    '12:00:00',
    'Salle Test',
    20,
    0,
    'pratique',
    'actif',
    1
);

-- 7. Vérifier si l'insertion a fonctionné
SELECT * FROM ateliers WHERE titre LIKE 'Test%' ORDER BY id DESC;

-- 8. Nettoyer le test si nécessaire
-- DELETE FROM ateliers WHERE titre LIKE 'Test%';

-- 9. Vérifier les tables liées (formateurs)
SELECT COUNT(*) as total_formateurs FROM Users WHERE role = 'formateur';
SELECT id, nom, prenom, email FROM Users WHERE role = 'formateur' LIMIT 5;
