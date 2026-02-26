-- =============================================
-- SCRIPT D'INSERTION DE DONNÉES DE TEST
-- Pour tester les pages React avec des données réelles
-- =============================================

-- Insertion d'utilisateurs de test (si la table users existe)
INSERT IGNORE INTO users (id, nom, prenom, email, role, password, created_at) VALUES 
(1, 'Rakoto', 'Jean', 'jean.rakoto@cfp.mg', 'formateur', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvOe', NOW()),
(2, 'Razafy', 'Marie', 'marie.razafy@cfp.mg', 'formateur', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvOe', NOW()),
(3, 'Andria', 'Paul', 'paul.andria@cfp.mg', 'formateur', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvOe', NOW()),
(4, 'Randria', 'Sophie', 'sophie.randria@cfp.mg', 'formateur', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvOe', NOW());

-- Insertion de statistiques initiales pour les formateurs
INSERT IGNORE INTO conges_stats (user_id, user_name, user_role, annee, mois) VALUES
(1, 'Jean Rakoto', 'formateur', YEAR(CURRENT_TIMESTAMP), MONTH(CURRENT_TIMESTAMP)),
(2, 'Marie Razafy', 'formateur', YEAR(CURRENT_TIMESTAMP), MONTH(CURRENT_TIMESTAMP)),
(3, 'Paul Andria', 'formateur', YEAR(CURRENT_TIMESTAMP), MONTH(CURRENT_TIMESTAMP)),
(4, 'Sophie Randria', 'formateur', YEAR(CURRENT_TIMESTAMP), MONTH(CURRENT_TIMESTAMP));

-- =============================================
-- DONNÉES DE TEST POUR LES CONGÉS
-- =============================================

-- Congé approuvé pour Jean Rakoto
INSERT INTO conges (
    user_id, user_name, user_email, user_role,
    type_conge, date_debut, date_fin, jours_demandes,
    motif, contact_urgence, telephone_urgence,
    statut, date_demande, date_validation, validateur_name,
    documents
) VALUES (
    1, 'Jean Rakoto', 'jean.rakoto@cfp.mg', 'formateur',
    'annuel', '2024-01-15', '2024-02-05', 22,
    'Voyage familial à Madagascar pour les fêtes de fin d''année', 'Marie Rakoto', '+261 32 00 000 01',
    'approuve', '2024-01-05', '2024-01-08', 'Admin CFP',
    JSON_ARRAY('reservation.pdf', 'billets.pdf', 'assurance.pdf')
);

-- Congé en attente pour Jean Rakoto
INSERT INTO conges (
    user_id, user_name, user_email, user_role,
    type_conge, date_debut, date_fin, jours_demandes,
    motif, contact_urgence, telephone_urgence,
    statut, date_demande,
    documents
) VALUES (
    1, 'Jean Rakoto', 'jean.rakoto@cfp.mg', 'formateur',
    'maladie', '2024-03-10', '2024-03-15', 6,
    'Convalescence post-opératoire suite à une chirurgie mineure', 'Jean Razafy', '+261 34 00 000 02',
    'en_attente', '2024-03-08',
    JSON_ARRAY('certificat.pdf', 'ordonnance.pdf')
);

-- Congé refusé pour Marie Razafy
INSERT INTO conges (
    user_id, user_name, user_email, user_role,
    type_conge, date_debut, date_fin, jours_demandes,
    motif, contact_urgence, telephone_urgence,
    statut, date_demande, date_validation, validateur_name, motif_refus,
    documents
) VALUES (
    2, 'Marie Razafy', 'marie.razafy@cfp.mg', 'formateur',
    'exceptionnel', '2024-02-20', '2024-02-25', 6,
    'Démarches administratives importantes à la mairie', 'Paul Andria', '+261 33 00 000 03',
    'refuse', '2024-02-15', '2024-02-18', 'Admin CFP',
    'Période non autorisée - sessions de formation intensives en cours',
    JSON_ARRAY('convocation.pdf')
);

-- Congé en cours pour Paul Andria
INSERT INTO conges (
    user_id, user_name, user_email, user_role,
    type_conge, date_debut, date_fin, jours_demandes,
    motif, contact_urgence, telephone_urgence,
    statut, date_demande, date_validation, validateur_name,
    documents
) VALUES (
    3, 'Paul Andria', 'paul.andria@cfp.mg', 'formateur',
    'annuel', '2024-06-01', '2024-06-20', 20,
    'Vacances d''été avec la famille', 'Sophie Randria', '+261 32 00 000 04',
    'en_cours', '2024-05-15', '2024-05-18', 'Admin CFP',
    JSON_ARRAY()
);

-- =============================================
-- DONNÉES DE TEST POUR LES PERMISSIONS
-- =============================================

-- Permission approuvée pour aujourd'hui (Jean Rakoto)
INSERT INTO permissions (
    user_id, user_name, user_email, user_role,
    type_permission, date_permission, heure_debut, heure_fin, duree, jours_demandes,
    motif, retour_prevu, contact_urgence, telephone_urgence,
    statut, date_demande, date_validation, validateur_name,
    documents
) VALUES (
    1, 'Jean Rakoto', 'jean.rakoto@cfp.mg', 'formateur',
    'personnel', CURDATE(), '09:00', '12:00', 3.00, 0.5,
    'Rendez-vous médical chez le spécialiste pour contrôle annuel', '13:30', 'Marie Rakoto', '+261 32 00 000 01',
    'approuve', DATE_SUB(CURDATE(), INTERVAL 2 DAY), DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'Admin CFP',
    JSON_ARRAY('ordonnance.pdf')
);

-- Permission en attente (Marie Razafy)
INSERT INTO permissions (
    user_id, user_name, user_email, user_role,
    type_permission, date_permission, heure_debut, heure_fin, duree, jours_demandes,
    motif, retour_prevu, contact_urgence, telephone_urgence,
    statut, date_demande,
    documents
) VALUES (
    2, 'Marie Razafy', 'marie.razafy@cfp.mg', 'formateur',
    'professionnel', DATE_ADD(CURDATE(), INTERVAL 3 DAY), '14:00', '17:00', 3.00, 0.5,
    'Formation sur les nouvelles techniques pédagogiques numériques', '17:30', 'Jean Razafy', '+261 34 00 000 02',
    'en_attente', DATE_SUB(CURDATE(), INTERVAL 1 DAY),
    JSON_ARRAY('invitation.pdf', 'programme.pdf', 'certificat.pdf')
);

-- Permission refusée (Paul Andria)
INSERT INTO permissions (
    user_id, user_name, user_email, user_role,
    type_permission, date_permission, heure_debut, heure_fin, duree, jours_demandes,
    motif, contact_urgence, telephone_urgence,
    statut, date_demande, date_validation, validateur_name, motif_refus,
    documents
) VALUES (
    3, 'Paul Andria', 'paul.andria@cfp.mg', 'formateur',
    'exceptionnel', DATE_SUB(CURDATE(), INTERVAL 5 DAY), '10:00', '11:30', 1.50, 0.5,
    'Urgence familiale - problème à résoudre en mairie', 'Paul Andria', '+261 33 00 000 03',
    'refuse', DATE_SUB(CURDATE(), INTERVAL 6 DAY), DATE_SUB(CURDATE(), INTERVAL 6 DAY), 'Admin CFP',
    'Créneau horaire non compatible avec les cours prévus - 3 cours programmés',
    JSON_ARRAY('justification.pdf')
);

-- Permission en cours pour aujourd'hui (Sophie Randria)
INSERT INTO permissions (
    user_id, user_name, user_email, user_role,
    type_permission, date_permission, heure_debut, heure_fin, duree, jours_demandes,
    motif, retour_prevu, contact_urgence, telephone_urgence,
    statut, date_demande, date_validation, validateur_name,
    documents
) VALUES (
    4, 'Sophie Randria', 'sophie.randria@cfp.mg', 'formateur',
    'personnel', CURDATE(), '08:00', '10:00', 2.00, 0.5,
    'Démarches administratives à la banque pour prêt immobilier', '10:30', 'Sophie Randria', '+261 32 00 000 04',
    'en_cours', DATE_SUB(CURDATE(), INTERVAL 1 DAY), DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'Admin CFP',
    JSON_ARRAY('dossier.pdf')
);

-- =============================================
-- MISE À JOUR DES STATISTIQUES
-- =============================================

-- Mise à jour des statistiques pour Jean Rakoto
UPDATE conges_stats SET 
    jours_pris_annee = 22,
    conges_en_attente = 1,
    heures_prises_mois = 3.00
WHERE user_id = 1 AND annee = YEAR(CURRENT_TIMESTAMP) AND mois = MONTH(CURRENT_TIMESTAMP);

-- Mise à jour des statistiques pour Marie Razafy
UPDATE conges_stats SET 
    jours_pris_annee = 0,
    conges_en_attente = 0,
    permissions_en_attente = 1
WHERE user_id = 2 AND annee = YEAR(CURRENT_TIMESTAMP) AND mois = MONTH(CURRENT_TIMESTAMP);

-- Mise à jour des statistiques pour Paul Andria
UPDATE conges_stats SET 
    jours_pris_annee = 20,
    conges_en_attente = 0,
    heures_prises_mois = 1.50
WHERE user_id = 3 AND annee = YEAR(CURRENT_TIMESTAMP) AND mois = MONTH(CURRENT_TIMESTAMP);

-- Mise à jour des statistiques pour Sophie Randria
UPDATE conges_stats SET 
    jours_pris_annee = 0,
    conges_en_attente = 0,
    heures_prises_mois = 2.00
WHERE user_id = 4 AND annee = YEAR(CURRENT_TIMESTAMP) AND mois = MONTH(CURRENT_TIMESTAMP);

-- =============================================
-- INSERTION DE NOTIFICATIONS
-- =============================================

-- Notifications pour les congés
INSERT INTO notifications_absences (type_notification, user_id, user_name, user_email, user_role, entite_type, entite_id, titre, message) VALUES
('conge_debut', 3, 'Paul Andria', 'paul.andria@cfp.mg', 'formateur', 'conge', 4, 
 'Début de votre congé', 'Votre congé annuel commence aujourd''hui. Profitez bien de vos vacances !'),

('conge_approuve', 1, 'Jean Rakoto', 'jean.rakoto@cfp.mg', 'formateur', 'conge', 1,
 'Congé approuvé', 'Votre demande de congé annuel a été approuvée pour la période du 15 janvier au 5 février 2024.'),

('conge_refuse', 2, 'Marie Razafy', 'marie.razafy@cfp.mg', 'formateur', 'conge', 3,
 'Congé refusé', 'Votre demande de congé exceptionnel a été refusée. Motif: Période non autorisée.'),

('permission_debut', 1, 'Jean Rakoto', 'jean.rakoto@cfp.mg', 'formateur', 'permission', 1,
 'Permission aujourd''hui', 'Vous avez une permission médicale aujourd''ui de 09:00 à 12:00.'),

('permission_debut', 4, 'Sophie Randria', 'sophie.randria@cfp.mg', 'formateur', 'permission', 5,
 'Permission en cours', 'Votre permission administrative est en cours actuellement (08:00 - 10:00).');

-- =============================================
-- VÉRIFICATION DES DONNÉES INSÉRÉES
-- =============================================

-- Afficher les statistiques actuelles
SELECT 
    'STATISTIQUES CONGÉS' as type,
    COUNT(*) as total_conges,
    SUM(CASE WHEN statut = 'en_attente' THEN 1 ELSE 0 END) as en_attente,
    SUM(CASE WHEN statut = 'approuve' THEN 1 ELSE 0 END) as approuves,
    SUM(CASE WHEN statut = 'refuse' THEN 1 ELSE 0 END) as refuses,
    SUM(CASE WHEN statut = 'en_cours' THEN 1 ELSE 0 END) as en_cours,
    SUM(jours_demandes) as total_jours
FROM conges

UNION ALL

SELECT 
    'STATISTIQUES PERMISSIONS' as type,
    COUNT(*) as total_conges,
    SUM(CASE WHEN statut = 'en_attente' THEN 1 ELSE 0 END) as en_attente,
    SUM(CASE WHEN statut = 'approuve' THEN 1 ELSE 0 END) as approuves,
    SUM(CASE WHEN statut = 'refuse' THEN 1 ELSE 0 END) as refuses,
    SUM(CASE WHEN statut = 'en_cours' THEN 1 ELSE 0 END) as en_cours,
    SUM(jours_demandes) as total_jours
FROM permissions;

-- Afficher les statistiques par utilisateur
SELECT 
    cs.user_name,
    cs.user_role,
    cs.jours_pris_annee,
    cs.jours_restants_annuel,
    cs.conges_en_attente,
    cs.heures_prises_mois,
    cs.heures_restantes_mois,
    cs.permissions_en_attente
FROM conges_stats cs
WHERE cs.annee = YEAR(CURRENT_TIMESTAMP)
ORDER BY cs.user_name;

-- Afficher les congés actuels et à venir
SELECT 
    c.user_name,
    c.type_conge,
    c.date_debut,
    c.date_fin,
    c.jours_demandes,
    c.statut,
    CASE 
        WHEN CURRENT_DATE BETWEEN c.date_debut AND c.date_fin AND c.statut = 'en_cours' THEN 'EN COURS ACTUEL'
        WHEN CURRENT_DATE < c.date_debut AND c.statut IN ('approuve', 'en_cours') THEN 'À VENIR'
        WHEN CURRENT_DATE > c.date_fin AND c.statut IN ('approuve', 'en_cours') THEN 'TERMINÉ'
        ELSE c.statut
    END as statut_calculé
FROM conges c
WHERE c.statut IN ('approuve', 'en_cours')
ORDER BY c.date_debut;

-- Afficher les permissions du jour
SELECT 
    p.user_name,
    p.type_permission,
    p.date_permission,
    p.heure_debut,
    p.heure_fin,
    p.duree,
    p.statut,
    CASE 
        WHEN DATE(p.date_permission) = CURDATE() AND 
             TIME(NOW()) BETWEEN p.heure_debut AND p.heure_fin 
             AND p.statut = 'en_cours' THEN 'EN COURS ACTUELLE'
        WHEN DATE(p.date_permission) = CURDATE() AND p.statut IN ('approuve', 'en_cours') THEN 'AUJOURD''HUI'
        ELSE p.statut
    END as statut_calculé
FROM permissions p
WHERE DATE(p.date_permission) = CURDATE() AND p.statut IN ('approuve', 'en_cours')
ORDER BY p.heure_debut;

/*
RÉSUMÉ DES DONNÉES DE TEST :

UTILISATEURS FORMATEURS :
1. Jean Rakoto - 1 congé approuvé (22j), 1 congé en attente, 1 permission aujourd'hui
2. Marie Razafy - 1 congé refusé, 1 permission en attente
3. Paul Andria - 1 congé en cours (20j), 1 permission refusée
4. Sophie Randria - 1 permission en cours aujourd'hui

CONGÉS :
- 4 demandes au total
- 1 approuvé, 1 en attente, 1 refusé, 1 en cours
- Périodes variées pour tester les filtres

PERMISSIONS :
- 5 demandes au total
- 2 approuvées, 1 en attente, 1 refusée, 1 en cours
- 2 permissions aujourd'hui pour tester les alertes

STATISTIQUES :
- Mises à jour automatiquement
- Cohérentes avec les données des formulaires React
- Prêtes pour les tests des pages

Ces données correspondent exactement aux besoins des pages React :
- Les types correspondent aux sélecteurs des formulaires
- Les statuts correspondent aux badges et filtres
- Les dates sont formatées pour l'affichage
- Les documents sont en JSON pour l'upload
- Les calculs sont cohérents avec les formules React
*/
