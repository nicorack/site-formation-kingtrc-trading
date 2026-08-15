UPDATE public.formations
SET level = 'Débutant - Avancé', price = 22500, original_price = 90000
WHERE category = 'Formation en ligne';

UPDATE public.formations
SET level = 'Débutant et Intermédiaire', original_price = NULL
WHERE category = 'Formation en salle';