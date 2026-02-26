-- Script pour ajouter la colonne 'statut' à la table Users
-- et mettre à jour les utilisateurs existants

USE gestion_formations;

-- Ajouter la colonne statut si elle n'existe pas
ALTER TABLE Users 
ADD COLUMN statut VARCHAR(50) DEFAULT 'en_attente' 
AFTER role;

-- Mettre à jour les utilisateurs existants
-- Les admins et formateurs sont automatiquement validés
UPDATE Users 
SET statut = 'valide' 
WHERE role IN ('admin', 'formateur');

-- Les apprenants existants sont aussi validés (pour ne pas bloquer les comptes existants)
UPDATE Users 
SET statut = 'valide' 
WHERE role = 'apprenant' AND statut = 'en_attente';

-- Afficher les résultats
SELECT id, nom, prenom, email, role, statut FROM Users;
