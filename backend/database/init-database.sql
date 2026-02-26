-- Script d'initialisation principal pour la base de données MySQL sur Railway
-- Exécute ce script dans l'ordre pour créer toutes les tables nécessaires

-- Import des tables de congés et permissions
SOURCE conges_permissions_mysql.sql;

-- Import des tables de cours si nécessaire
-- SOURCE add-cours-pdf-fields.sql;

-- Import des données de test si nécessaire
-- SOURCE test_data.sql;

-- Confirmation d'initialisation
SELECT 'Base de données initialisée avec succès' as status;
