-- Étape 1: Vérifiez si la table cours existe et sa structure
SHOW TABLES LIKE 'cours';
DESCRIBE cours;

-- Étape 2: Vérifiez les contraintes et clés étrangères
SHOW CREATE TABLE cours;

-- Étape 3: Test d'insertion direct pour voir l'erreur exacte
INSERT INTO cours (titre, description, date, heureDebut, heureFin, salle, type, statut, formateurId) 
VALUES ('Test Debug', 'Debug insertion', '2024-02-20', '09:00', '11:00', 'Salle Debug', 'pratique', 'actif', 1);

-- Étape 4: Si l'insertion fonctionne, le problème est dans le controller Node.js
-- Vérifiez le controller actuel en cherchant "formation" ou "Formation"
-- Recherchez dans votre fichier controller les mots-clés :
-- - "formation"
-- - "Formation"
-- - "formationId"
-- - "SELECT * FROM formations WHERE"

-- Étape 5: Testez l'API directement avec curl ou Postman
-- curl -X POST http://localhost:3000/api/formateur/cours \
--   -H "Content-Type: application/json" \
--   -H "Authorization: Bearer VOTRE_TOKEN" \
--   -d '{
--     "titre": "Test API",
--     "description": "Test via API",
--     "date": "2024-02-20",
--     "heureDebut": "09:00",
--     "heureFin": "11:00",
--     "salle": "Salle API",
--     "type": "pratique",
--     "statut": "actif"
--   }'

-- Étape 6: Vérifiez les logs du backend pour voir l'erreur exacte
-- Dans votre terminal backend, cherchez les messages d'erreur
