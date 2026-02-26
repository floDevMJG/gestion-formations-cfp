-- =============================================
-- BASE DE DONNÉES GESTION CONGÉS ET PERMISSIONS
-- CFP Charpentier Marine
-- Compatible avec nos pages React
-- =============================================

-- Création de la base de données (si nécessaire)
-- CREATE DATABASE cfp_marine;
-- USE cfp_marine;

-- =============================================
-- TABLE DES CONGÉS (+10 jours minimum)
-- =============================================
CREATE TABLE IF NOT EXISTS conges (
    id INT PRIMARY KEY AUTO_INCREMENT,
    
    -- Informations sur l'employé
    user_id INT NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_role ENUM('admin', 'formateur', 'apprenant') NOT NULL,
    
    -- Type et période du congé
    type_conge ENUM('annuel', 'maladie', 'maternite', 'exceptionnel') NOT NULL,
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    jours_demandes INT NOT NULL,
    
    -- Informations de contact
    motif TEXT NOT NULL,
    contact_urgence VARCHAR(255),
    telephone_urgence VARCHAR(50),
    
    -- Statut et validation
    statut ENUM('en_attente', 'approuve', 'refuse', 'en_cours') DEFAULT 'en_attente',
    date_demande DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_validation DATETIME NULL,
    validateur_id INT NULL,
    validateur_name VARCHAR(255) NULL,
    motif_refus TEXT NULL,
    
    -- Documents
    documents JSON NULL, -- Stocke les noms de fichiers
    
    -- Métadonnées
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Index pour optimisation
    INDEX idx_user_id (user_id),
    INDEX idx_statut (statut),
    INDEX idx_date_debut (date_debut),
    INDEX idx_date_fin (date_fin),
    INDEX idx_date_demande (date_demande),
    INDEX idx_type_conge (type_conge)
);

-- =============================================
-- TABLE DES PERMISSIONS (1-5 jours maximum)
-- =============================================
CREATE TABLE IF NOT EXISTS permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    
    -- Informations sur l'employé
    user_id INT NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_role ENUM('admin', 'formateur', 'apprenant') NOT NULL,
    
    -- Type et période de la permission
    type_permission ENUM('personnel', 'professionnel', 'exceptionnel') NOT NULL,
    date_permission DATE NOT NULL,
    heure_debut TIME NOT NULL,
    heure_fin TIME NOT NULL,
    duree DECIMAL(4,2) NOT NULL, -- Durée en heures (ex: 3.5)
    jours_demandes DECIMAL(3,1) NOT NULL, -- Jours (0.5, 1, 1.5, etc.)
    
    -- Informations de contact
    motif TEXT NOT NULL,
    retour_prevu TIME NULL,
    contact_urgence VARCHAR(255),
    telephone_urgence VARCHAR(50),
    
    -- Statut et validation
    statut ENUM('en_attente', 'approuve', 'refuse', 'en_cours') DEFAULT 'en_attente',
    date_demande DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_validation DATETIME NULL,
    validateur_id INT NULL,
    validateur_name VARCHAR(255) NULL,
    motif_refus TEXT NULL,
    
    -- Documents
    documents JSON NULL, -- Stocke les noms de fichiers
    
    -- Métadonnées
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Index pour optimisation
    INDEX idx_user_id (user_id),
    INDEX idx_statut (statut),
    INDEX idx_date_permission (date_permission),
    INDEX idx_date_demande (date_demande),
    INDEX idx_type_permission (type_permission),
    INDEX idx_heure_debut (heure_debut),
    INDEX idx_heure_fin (heure_fin)
);

-- =============================================
-- TABLE DES STATISTIQUES CONGÉS PAR UTILISATEUR
-- =============================================
CREATE TABLE IF NOT EXISTS conges_stats (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    user_name VARCHAR(255) NOT NULL,
    user_role ENUM('admin', 'formateur', 'apprenant') NOT NULL,
    
    -- Statistiques annuelles (congés)
    total_jours_annuel INT DEFAULT 30,
    jours_pris_annee INT DEFAULT 0,
    conges_en_attente INT DEFAULT 0,
    
    -- Statistiques mensuelles (permissions)
    total_jours_mensuel INT DEFAULT 5,
    heures_prises_mois DECIMAL(6,2) DEFAULT 0,
    permissions_en_attente INT DEFAULT 0,
    
    -- Métadonnées
    annee INT DEFAULT (YEAR(CURRENT_TIMESTAMP)),
    mois INT DEFAULT (MONTH(CURRENT_TIMESTAMP)),
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Index
    INDEX idx_user_id (user_id),
    INDEX idx_annee (annee),
    INDEX idx_mois (mois),
    
    -- Contrainte unique pour éviter les doublons par utilisateur/année/mois
    UNIQUE KEY unique_user_year_month (user_id, annee, mois)
);

-- =============================================
-- TABLE DES NOTIFICATIONS CONGÉS/PERMISSIONS
-- =============================================
CREATE TABLE IF NOT EXISTS notifications_absences (
    id INT PRIMARY KEY AUTO_INCREMENT,
    
    -- Type de notification
    type_notification ENUM('conge_demande', 'permission_demande', 'conge_approuve', 'permission_approuve', 
                          'conge_refuse', 'permission_refuse', 'conge_debut', 'permission_debut', 
                          'conge_fin', 'permission_fin') NOT NULL,
    
    -- Informations liées
    user_id INT NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_role ENUM('admin', 'formateur', 'apprenant') NOT NULL,
    
    -- Référence à l'entité concernée
    entite_type ENUM('conge', 'permission') NOT NULL,
    entite_id INT NOT NULL,
    
    -- Message de notification
    titre VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Statut de lecture
    lu BOOLEAN DEFAULT FALSE,
    date_lecture DATETIME NULL,
    
    -- Métadonnées
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Index
    INDEX idx_user_id (user_id),
    INDEX idx_entite (entite_type, entite_id),
    INDEX idx_lu (lu),
    INDEX idx_created_at (created_at)
);

-- =============================================
-- TRIGGERS POUR METTRE À JOUR LES STATISTIQUES
-- =============================================

DELIMITER //

-- Trigger pour mettre à jour les statistiques lors d'une demande de congé
CREATE TRIGGER update_conges_stats_on_insert
AFTER INSERT ON conges
FOR EACH ROW
BEGIN
    INSERT INTO conges_stats (user_id, user_name, user_role, annee)
    VALUES (NEW.user_id, NEW.user_name, NEW.user_role, YEAR(NEW.date_debut))
    ON DUPLICATE KEY UPDATE
        conges_en_attente = conges_en_attente + 1,
        updated_at = CURRENT_TIMESTAMP;
END//

-- Trigger pour mettre à jour les statistiques lors d'une mise à jour de congé
CREATE TRIGGER update_conges_stats_on_update
AFTER UPDATE ON conges
FOR EACH ROW
BEGIN
    -- Si le statut change de en_attente à approuve
    IF OLD.statut = 'en_attente' AND NEW.statut = 'approuve' THEN
        UPDATE conges_stats 
        SET 
            conges_en_attente = conges_en_attente - 1,
            jours_pris_annee = jours_pris_annee + NEW.jours_demandes,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = NEW.user_id AND annee = YEAR(NEW.date_debut);
    
    -- Si le statut change de approuve à refuse (remboursement des jours)
    ELSEIF OLD.statut = 'approuve' AND NEW.statut = 'refuse' THEN
        UPDATE conges_stats 
        SET 
            jours_pris_annee = GREATEST(0, jours_pris_annee - NEW.jours_demandes),
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = NEW.user_id AND annee = YEAR(NEW.date_debut);
    
    -- Si le statut change de en_attente à refuse
    ELSEIF OLD.statut = 'en_attente' AND NEW.statut = 'refuse' THEN
        UPDATE conges_stats 
        SET 
            conges_en_attente = conges_en_attente - 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = NEW.user_id AND annee = YEAR(NEW.date_debut);
    END IF;
END//

-- Trigger pour mettre à jour les statistiques lors d'une demande de permission
CREATE TRIGGER update_permissions_stats_on_insert
AFTER INSERT ON permissions
FOR EACH ROW
BEGIN
    INSERT INTO conges_stats (user_id, user_name, user_role, annee, mois)
    VALUES (NEW.user_id, NEW.user_name, NEW.user_role, YEAR(NEW.date_permission), MONTH(NEW.date_permission))
    ON DUPLICATE KEY UPDATE
        permissions_en_attente = permissions_en_attente + 1,
        updated_at = CURRENT_TIMESTAMP;
END//

-- Trigger pour mettre à jour les statistiques lors d'une mise à jour de permission
CREATE TRIGGER update_permissions_stats_on_update
AFTER UPDATE ON permissions
FOR EACH ROW
BEGIN
    -- Si le statut change de en_attente à approuve
    IF OLD.statut = 'en_attente' AND NEW.statut = 'approuve' THEN
        UPDATE conges_stats 
        SET 
            permissions_en_attente = permissions_en_attente - 1,
            heures_prises_mois = heures_prises_mois + NEW.duree,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = NEW.user_id 
        AND annee = YEAR(NEW.date_permission) 
        AND mois = MONTH(NEW.date_permission);
    
    -- Si le statut change de approuve à refuse
    ELSEIF OLD.statut = 'approuve' AND NEW.statut = 'refuse' THEN
        UPDATE conges_stats 
        SET 
            heures_prises_mois = GREATEST(0, heures_prises_mois - NEW.duree),
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = NEW.user_id 
        AND annee = YEAR(NEW.date_permission) 
        AND mois = MONTH(NEW.date_permission);
    
    -- Si le statut change de en_attente à refuse
    ELSEIF OLD.statut = 'en_attente' AND NEW.statut = 'refuse' THEN
        UPDATE conges_stats 
        SET 
            permissions_en_attente = permissions_en_attente - 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = NEW.user_id 
        AND annee = YEAR(NEW.date_permission) 
        AND mois = MONTH(NEW.date_permission);
    END IF;
END//

DELIMITER ;

-- =============================================
-- VUES PRATIQUES POUR NOTRE APPLICATION
-- =============================================

-- Vue pour les statistiques avec calculs
CREATE VIEW v_conges_stats_calculées AS
SELECT 
    cs.*,
    (cs.total_jours_annuel - cs.jours_pris_annee) as jours_restants_annuel,
    (cs.total_jours_mensuel * 8 - cs.heures_prises_mois) as heures_restantes_mois
FROM conges_stats cs;

-- Vue pour les congés actifs
CREATE VIEW v_conges_actifs AS
SELECT 
    c.*,
    u.email as user_email_original,
    CASE 
        WHEN CURRENT_DATE BETWEEN c.date_debut AND c.date_fin AND c.statut = 'en_cours' THEN 'en_cours_actuel'
        WHEN CURRENT_DATE < c.date_debut AND c.statut IN ('approuve', 'en_cours') THEN 'a_venir'
        WHEN CURRENT_DATE > c.date_fin AND c.statut IN ('approuve', 'en_cours') THEN 'termine'
        ELSE c.statut
    END as statut_calculé,
    DATEDIFF(c.date_fin, c.date_debut) + 1 as duree_calculee
FROM conges c
LEFT JOIN users u ON c.user_id = u.id
WHERE c.statut IN ('approuve', 'en_cours');

-- Vue pour les permissions du jour
CREATE VIEW v_permissions_aujourdhui AS
SELECT 
    p.*,
    u.email as user_email_original,
    CASE 
        WHEN DATE(p.date_permission) = CURRENT_DATE AND 
             TIME(NOW()) BETWEEN p.heure_debut AND p.heure_fin 
             AND p.statut = 'en_cours' THEN 'en_cours_actuelle'
        WHEN DATE(p.date_permission) = CURRENT_DATE AND p.statut IN ('approuve', 'en_cours') THEN 'aujourdhui'
        ELSE p.statut
    END as statut_calculé,
    TIMEDIFF(p.heure_fin, p.heure_debut) as duree_calculee
FROM permissions p
LEFT JOIN users u ON p.user_id = u.id
WHERE DATE(p.date_permission) = CURRENT_DATE AND p.statut IN ('approuve', 'en_cours');

-- Vue pour les statistiques globales
CREATE VIEW v_stats_globales AS
SELECT 
    'conges' as type,
    COUNT(*) as total,
    SUM(CASE WHEN statut = 'en_attente' THEN 1 ELSE 0 END) as en_attente,
    SUM(CASE WHEN statut = 'approuve' THEN 1 ELSE 0 END) as approuves,
    SUM(CASE WHEN statut = 'refuse' THEN 1 ELSE 0 END) as refuses,
    SUM(CASE WHEN statut = 'en_cours' THEN 1 ELSE 0 END) as en_cours,
    SUM(jours_demandes) as total_jours
FROM conges
WHERE YEAR(date_debut) = YEAR(CURRENT_TIMESTAMP)

UNION ALL

SELECT 
    'permissions' as type,
    COUNT(*) as total,
    SUM(CASE WHEN statut = 'en_attente' THEN 1 ELSE 0 END) as en_attente,
    SUM(CASE WHEN statut = 'approuve' THEN 1 ELSE 0 END) as approuves,
    SUM(CASE WHEN statut = 'refuse' THEN 1 ELSE 0 END) as refuses,
    SUM(CASE WHEN statut = 'en_cours' THEN 1 ELSE 0 END) as en_cours,
    SUM(jours_demandes) as total_jours
FROM permissions
WHERE YEAR(date_permission) = YEAR(CURRENT_TIMESTAMP);

-- =============================================
-- DONNÉES DE TEST (OPTIONNEL)
-- =============================================

-- Insertion d'un utilisateur de test (si la table users existe)
-- INSERT IGNORE INTO users (id, nom, prenom, email, role, password) VALUES 
-- (1, 'Rakoto', 'Jean', 'jean.rakoto@cfp.mg', 'formateur', 'password123'),
-- (2, 'Razafy', 'Marie', 'marie.razafy@cfp.mg', 'formateur', 'password123'),
-- (3, 'Andria', 'Paul', 'paul.andria@cfp.mg', 'formateur', 'password123');

-- Insertion de statistiques initiales pour les formateurs
INSERT IGNORE INTO conges_stats (user_id, user_name, user_role, annee, mois) VALUES
(1, 'Jean Rakoto', 'formateur', YEAR(CURRENT_TIMESTAMP), MONTH(CURRENT_TIMESTAMP)),
(2, 'Marie Razafy', 'formateur', YEAR(CURRENT_TIMESTAMP), MONTH(CURRENT_TIMESTAMP)),
(3, 'Paul Andria', 'formateur', YEAR(CURRENT_TIMESTAMP), MONTH(CURRENT_TIMESTAMP));

-- =============================================
-- PROCÉDURES STOCKÉES UTILES
-- =============================================

DELIMITER //

-- Procédure pour vérifier les jours disponibles pour un congé
CREATE PROCEDURE verifier_disponibilite_conge(
    IN p_user_id INT,
    IN p_jours_demandes INT,
    IN p_annee INT,
    OUT p_jours_disponibles INT,
    OUT p_peut_demander BOOLEAN
)
BEGIN
    SELECT jours_restants_annuel INTO p_jours_disponibles
    FROM conges_stats 
    WHERE user_id = p_user_id AND annee = p_annee;
    
    SET p_peut_demander = (p_jours_disponibles >= p_jours_demandes);
END//

-- Procédure pour vérifier les heures disponibles pour une permission
CREATE PROCEDURE verifier_disponibilite_permission(
    IN p_user_id INT,
    IN p_heures_demandees DECIMAL(4,2),
    IN p_annee INT,
    IN p_mois INT,
    OUT p_heures_disponibles DECIMAL(6,2),
    OUT p_peut_demander BOOLEAN
)
BEGIN
    SELECT heures_restantes_mois INTO p_heures_disponibles
    FROM conges_stats 
    WHERE user_id = p_user_id AND annee = p_annee AND mois = p_mois;
    
    SET p_peut_demander = (p_heures_disponibles >= p_heures_demandees);
END//

DELIMITER ;

-- =============================================
-- COMMENTAIRES ET DOCUMENTATION
-- =============================================

/*
STRUCTURE DES TABLES :

1. CONGES :
   - Gère les demandes de congé de 10 jours minimum
   - Types : annuel, maladie, maternité, exceptionnel
   - Statuts : en_attente, approuve, refuse, en_cours
   - Documents stockés en JSON
   - Triggers automatiques pour les statistiques

2. PERMISSIONS :
   - Gère les permissions de 1 à 5 jours maximum
   - Types : personnel, professionnel, exceptionnel
   - Horaires précis avec durée en heures
   - Conversion automatique en jours (0.5, 1, 1.5, etc.)
   - Heure de retour prévue

3. CONGES_STATS :
   - Statistiques par utilisateur
   - Annuelles pour les congés (30 jours par défaut)
   - Mensuelles pour les permissions (5 jours = 40 heures)
   - Mise à jour automatique via triggers

4. NOTIFICATIONS_ABSENCES :
   - Historique des notifications
   - Types variés de notifications
   - Suivi de lecture

VUES UTILITAIRES :
- v_conges_actifs : Congés actuellement en cours ou à venir
- v_permissions_aujourdhui : Permissions du jour avec statut calculé
- v_stats_globales : Statistiques globales pour le dashboard admin

PROCÉDURES STOCKÉES :
- verifier_disponibilite_conge : Vérifie si un utilisateur peut prendre un congé
- verifier_disponibilite_permission : Vérifie si un utilisateur peut prendre une permission

INTÉGRATION AVEC L'APPLICATION REACT :
- Les champs correspondent exactement aux formulaires
- Les statuts correspondent aux badges et filtres
- Les dates sont au format DATE/DATETIME standard
- Les documents sont stockés en JSON pour faciliter l'upload
- Les triggers maintiennent les statistiques automatiquement

OPTIMISATIONS :
- Index sur tous les champs de recherche et filtrage
- Vues pour les requêtes complexes
- Triggers pour la cohérence des données
- Contraintes pour la validation des données
*/
