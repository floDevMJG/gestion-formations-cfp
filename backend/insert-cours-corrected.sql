-- Script corrigé pour ajouter 3 cours dans la table cours
-- Utilise uniquement les colonnes qui existent réellement

-- Insertion des 3 cours avec les colonnes existantes
INSERT INTO cours (titre, description, date, heureDebut, heureFin, salle, type, statut, formateurId) 
VALUES 
('Cours Ébénisterie Navale', 'Techniques d''ébénisterie appliquées à la construction navale : placages, marqueterie et finitions de luxe pour les aménagements intérieurs de yachts et bateaux de prestige', '2024-02-20', '09:00', '13:00', 'Atelier Ébénisterie 201', 'pratique', 'actif', 1),

('Cours Cordage et Gréement', 'Fabrication et entretien des cordages et gréements traditionnels : nœuds marins, épissures, et techniques de montage des voiles et équipements de pont', '2024-02-25', '14:00', '17:30', 'Atelier Gréement 202', 'hybride', 'actif', 1),

('Cours Restauration de Bateaux Anciens', 'Techniques de restauration et conservation des bateaux anciens et classés : analyse structurelle, remplacement des pièces dégradées et respect des méthodes traditionnelles', '2024-03-01', '08:30', '12:30', 'Atelier Restauration 203', 'pratique', 'actif', 1);

-- Vérification des cours ajoutés
SELECT id, titre, date, heureDebut, heureFin, salle, type, statut, formateurId FROM cours WHERE formateurId = 1 ORDER BY date DESC;
