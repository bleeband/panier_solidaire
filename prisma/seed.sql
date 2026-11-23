
-- Panier Solidaire - Données de test fictives
-- Firme Pentabyte - Le Panier solidaire
-- A exécuter uniquement dans une base de développement.

-- 1. Bénévoles fictifs
INSERT INTO "Benevole"
(id, nom, prenom, courriel, telephone,
 disponibilites, taches_preferees, mot_de_passe)
VALUES
('11111111-1111-4111-8111-111111111111',
 'Exemple', 'Alice', 'alice@example.com',
 '000-000-0000', 'Lundi matin', 'Tri des aliments', NULL),

('22222222-2222-4222-8222-222222222222',
 'Fictif', 'Marc', NULL,
 '000-000-0000', 'Mardi après-midi', 'Distribution', NULL),

('33333333-3333-4333-8333-333333333333',
 'Test', 'Sara', 'sara@example.com',
 '000-000-0000', 'Lundi et mardi', 'Tri des aliments', NULL)
ON CONFLICT (id) DO NOTHING;

-- 2. Quarts de travail fictifs
INSERT INTO "Quart"
(id, date, heure_debut, heure_fin,
 nombre_benevoles_requis, tache)
VALUES
('44444444-4444-4444-8444-444444444444',
 '2026-11-23', '09:00', '12:00',
 3, 'Tri des aliments'),

('55555555-5555-4555-8555-555555555555',
 '2026-11-24', '13:00', '16:00',
 2, 'Distribution')
ON CONFLICT (id) DO NOTHING;

-- 3. Inscriptions fictives
INSERT INTO "Inscription"
(id, benevole_id, quart_id, presence, date_inscription)
VALUES
('66666666-6666-4666-8666-666666666666',
 '11111111-1111-4111-8111-111111111111',
 '44444444-4444-4444-8444-444444444444',
 TRUE, NOW()),

('77777777-7777-4777-8777-777777777777',
 '33333333-3333-4333-8333-333333333333',
 '44444444-4444-4444-8444-444444444444',
 FALSE, NOW()),

('88888888-8888-4888-8888-888888888888',
 '22222222-2222-4222-8222-222222222222',
 '55555555-5555-4555-8555-555555555555',
 NULL, NOW())
ON CONFLICT (id) DO NOTHING;
