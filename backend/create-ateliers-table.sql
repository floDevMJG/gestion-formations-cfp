-- Création de la table ateliers
CREATE TABLE IF NOT EXISTS ateliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    heure_debut TIME NOT NULL,
    heure_fin TIME NOT NULL,
    salle VARCHAR(100) NOT NULL,
    capacite INT NOT NULL DEFAULT 20,
    inscrits INT DEFAULT 0,
    type ENUM('pratique', 'theorique', 'hybride') DEFAULT 'pratique',
    statut ENUM('actif', 'annulé', 'terminé') DEFAULT 'actif',
    formateur_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (formateur_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_formateur (formateur_id),
    INDEX idx_date (date),
    INDEX idx_statut (statut),
    INDEX idx_type (type)
);

-- Insertion de données d'exemple pour tester
INSERT INTO ateliers (titre, description, date, heure_debut, heure_fin, salle, capacite, inscrits, type, statut, formateur_id) VALUES
('Atelier Charpente Marine Traditionnelle', 'Apprentissage des techniques traditionnelles de charpenterie marine : assemblages, jointures et travail du bois pour la construction navale', '2024-01-15', '09:00:00', '12:00:00', 'Atelier Naval 101', 20, 15, 'pratique', 'actif', 1),
('Atelier Construction Coque en Bois', 'Maîtrise des techniques de construction de coques en bois : bordé, membrures et renforts pour bateaux traditionnels', '2024-01-18', '14:00:00', '17:00:00', 'Atelier Naval 102', 15, 12, 'pratique', 'actif', 1),
('Atelier Vitrerie Marine', 'Techniques de vitrerie marine : pose de hublots, fenêtres et vitrages spécifiques pour les embarcations', '2024-01-22', '10:00:00', '13:00:00', 'Atelier Naval 103', 18, 16, 'pratique', 'actif', 1);
