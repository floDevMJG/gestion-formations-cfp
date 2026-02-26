-- Ajouter les champs pour les fichiers PDF à la table Cours existante
ALTER TABLE Cours 
ADD COLUMN IF NOT EXISTS fichierUrl VARCHAR(500) NULL,
ADD COLUMN IF NOT EXISTS fichierNom VARCHAR(255) NULL;

-- Mettre à jour le type pour inclure les cours PDF
ALTER TABLE Cours 
MODIFY COLUMN type ENUM('cours', 'td', 'tp', 'examen', 'pdf') DEFAULT 'cours';

-- Afficher la structure de la table pour vérification
DESCRIBE Cours;
