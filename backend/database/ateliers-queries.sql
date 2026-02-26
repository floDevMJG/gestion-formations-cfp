-- Requêtes SQL compatibles avec le formulaire d'ajout d'ateliers

-- 1. Requête d'insertion (CREATE) - Compatible avec le formulaire
INSERT INTO ateliers (
    titre, 
    description, 
    date, 
    heure_debut, 
    heure_fin, 
    salle, 
    capacite, 
    type, 
    statut, 
    formateur_id
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);

-- 2. Requête de sélection (READ) - Pour afficher tous les ateliers d'un formateur
SELECT 
    id,
    titre,
    description,
    DATE_FORMAT(date, '%Y-%m-%d') as date,
    TIME_FORMAT(heure_debut, '%H:%i') as heureDebut,
    TIME_FORMAT(heure_fin, '%H:%i') as heureFin,
    salle,
    capacite,
    inscrits,
    type,
    statut,
    DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as createdAt,
    DATE_FORMAT(updated_at, '%Y-%m-%d %H:%i:%s') as updatedAt
FROM ateliers 
WHERE formateur_id = ?
ORDER BY date DESC, heure_debut DESC;

-- 3. Requête de mise à jour (UPDATE) - Compatible avec le formulaire d'édition
UPDATE ateliers 
SET 
    titre = ?, 
    description = ?, 
    date = ?, 
    heure_debut = ?, 
    heure_fin = ?, 
    salle = ?, 
    capacite = ?, 
    type = ?, 
    statut = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ? AND formateur_id = ?;

-- 4. Requête de suppression (DELETE)
DELETE FROM ateliers 
WHERE id = ? AND formateur_id = ?;

-- 5. Requête de recherche - Pour la fonction de recherche
SELECT 
    id,
    titre,
    description,
    DATE_FORMAT(date, '%Y-%m-%d') as date,
    TIME_FORMAT(heure_debut, '%H:%i') as heureDebut,
    TIME_FORMAT(heure_fin, '%H:%i') as heureFin,
    salle,
    capacite,
    inscrits,
    type,
    statut
FROM ateliers 
WHERE formateur_id = ? 
AND (
    LOWER(titre) LIKE LOWER(?) OR 
    LOWER(description) LIKE LOWER(?) OR
    LOWER(salle) LIKE LOWER(?)
)
ORDER BY date DESC, heure_debut DESC;

-- 6. Requête de filtrage - Pour les filtres par type et statut
SELECT 
    id,
    titre,
    description,
    DATE_FORMAT(date, '%Y-%m-%d') as date,
    TIME_FORMAT(heure_debut, '%H:%i') as heureDebut,
    TIME_FORMAT(heure_fin, '%H:%i') as heureFin,
    salle,
    capacite,
    inscrits,
    type,
    statut
FROM ateliers 
WHERE formateur_id = ?
AND (? = 'all' OR type = ?)
AND (? = 'all' OR statut = ?)
ORDER BY date DESC, heure_debut DESC;

-- 7. Requête pour obtenir un atelier spécifique (pour l'édition)
SELECT 
    id,
    titre,
    description,
    DATE_FORMAT(date, '%Y-%m-%d') as date,
    TIME_FORMAT(heure_debut, '%H:%i') as heureDebut,
    TIME_FORMAT(heure_fin, '%H:%i') as heureFin,
    salle,
    capacite,
    type,
    statut
FROM ateliers 
WHERE id = ? AND formateur_id = ?;

-- 8. Requête pour les statistiques
SELECT 
    COUNT(*) as totalAteliers,
    COUNT(CASE WHEN statut = 'actif' THEN 1 END) as ateliersActifs,
    COUNT(CASE WHEN statut = 'terminé' THEN 1 END) as ateliersTermines,
    COUNT(CASE WHEN statut = 'annulé' THEN 1 END) as ateliersAnnules,
    SUM(inscrits) as totalInscrits,
    SUM(capacite) as totalCapacite,
    COUNT(CASE WHEN date >= CURDATE() THEN 1 END) as ateliersAVenir,
    COUNT(CASE WHEN date = CURDATE() THEN 1 END) as ateliersAujourdhui
FROM ateliers 
WHERE formateur_id = ?;

-- 9. Requête pour mettre à jour le nombre d'inscrits
UPDATE ateliers 
SET inscrits = (
    SELECT COUNT(*) 
    FROM inscriptions 
    WHERE atelier_id = ateliers.id AND statut = 'confirmé'
)
WHERE id = ?;

-- 10. Requête pour vérifier les disponibilités (conflits d'horaire)
SELECT 
    id,
    titre,
    date,
    heure_debut,
    heure_fin,
    salle
FROM ateliers 
WHERE formateur_id = ? 
AND date = ?
AND (
    (heure_debut <= ? AND heure_fin > ?) OR
    (heure_debut < ? AND heure_fin >= ?) OR
    (heure_debut >= ? AND heure_fin <= ?)
)
AND id != ?
ORDER BY heure_debut;
