CREATE TABLE public.formation_links (
  formation_id uuid PRIMARY KEY REFERENCES public.formations(id) ON DELETE CASCADE,
  drive_url text,
  telegram_url text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.formation_links TO authenticated;
GRANT ALL ON public.formation_links TO service_role;
ALTER TABLE public.formation_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage links" ON public.formation_links FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Buyers view links" ON public.formation_links FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.formation_id = formation_links.formation_id AND o.user_id = auth.uid() AND o.status = 'confirmed'));
UPDATE public.formations SET is_active = false WHERE category = (SELECT category FROM public.formations WHERE title ILIKE '%en ligne%' LIMIT 1) AND title ILIKE '%en ligne%';