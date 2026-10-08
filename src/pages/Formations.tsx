import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Layout } from "@/components/Layout";
import { CourseCard } from "@/components/CourseCard";
import { categories } from "@/lib/data";
import { formationCategoryLabel } from "@/lib/site";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Formation = Tables<"formations">;

const Formations = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Toutes");
  const [courses, setCourses] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      const { data } = await supabase
        .from("formations")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      setCourses(data || []);
      setLoading(false);
    };
    fetchCourses();
  }, []);

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        (c.short_description || "").toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        activeCategory === "Toutes" || c.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory, courses]);

  return (
    <Layout>
      <section className="gradient-hero py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 font-display text-3xl font-bold text-primary-foreground md:text-4xl">
            Nos <span className="text-accent">formations trading</span>
          </h1>
          <p className="mx-auto mb-8 max-w-md text-primary-foreground/80">
            Choisissez la formule en ligne ou en salle et commencez à maîtriser les marchés.
          </p>
          <div className="mx-auto max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Rechercher une formation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-card border-border"
            />
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? "gradient-accent text-accent-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-muted"
                }`}
              >
                {formationCategoryLabel(cat)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="py-20 text-center text-muted-foreground">Chargement...</div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-muted-foreground">Aucune formation trouvée.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((course, i) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <CourseCard course={course} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Formations;
