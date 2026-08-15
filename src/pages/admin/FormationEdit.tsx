import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, GripVertical, BookOpen, ShoppingCart, BarChart3, LogOut, Save, Upload, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const categories = ["Trading", "Forex", "Indices synthétiques", "Autre"];
const levels = ["Débutant", "Intermédiaire", "Avancé"];

interface ModuleData {
  id?: string;
  title: string;
  sort_order: number;
  lessons: LessonData[];
}

interface LessonData {
  id?: string;
  title: string;
  duration: string;
  type: string;
  video_url: string;
  video_file?: File | null;
  uploading?: boolean;
  sort_order: number;
}

const FormationEdit = () => {
  const { id } = useParams();
  const isNew = id === "new";
  const { isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Trading");
  const [level, setLevel] = useState("Débutant");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState(0);
  const [imageUrl, setImageUrl] = useState("");
  const [objectives, setObjectives] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [modules, setModules] = useState<ModuleData[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !isAdmin) navigate("/");
  }, [loading, isAdmin]);

  useEffect(() => {
    if (!isNew && isAdmin) loadFormation();
  }, [id, isAdmin]);

  const loadFormation = async () => {
    const { data: f } = await supabase
      .from("formations")
      .select("*")
      .eq("id", id!)
      .single();
    if (!f) return navigate("/admin/formations");

    setTitle(f.title);
    setShortDesc(f.short_description || "");
    setDescription(f.description || "");
    setCategory(f.category);
    setLevel(f.level);
    setDuration(f.duration || "");
    setPrice(f.price);
    setImageUrl(f.image_url || "");
    setObjectives((f.objectives || []).join("\n"));
    setIsActive(f.is_active ?? true);

    const { data: mods } = await supabase
      .from("modules")
      .select("*, lessons(*)")
      .eq("formation_id", id!)
      .order("sort_order");

    setModules(
      (mods || []).map((m: any) => ({
        id: m.id,
        title: m.title,
        sort_order: m.sort_order,
        lessons: (m.lessons || [])
          .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
          .map((l: any) => ({
            id: l.id,
            title: l.title,
            duration: l.duration || "",
            type: l.type,
            video_url: l.video_url || "",
            sort_order: l.sort_order,
          })),
      }))
    );
  };

  const addModule = () => {
    setModules([...modules, { title: "", sort_order: modules.length, lessons: [] }]);
  };

  const addLesson = (modIdx: number) => {
    const updated = [...modules];
    updated[modIdx].lessons.push({
      title: "",
      duration: "",
      type: "video",
      video_url: "",
      sort_order: updated[modIdx].lessons.length,
    });
    setModules(updated);
  };

  const removeModule = (idx: number) => {
    setModules(modules.filter((_, i) => i !== idx));
  };

  const removeLesson = (modIdx: number, lesIdx: number) => {
    const updated = [...modules];
    updated[modIdx].lessons = updated[modIdx].lessons.filter((_, i) => i !== lesIdx);
    setModules(updated);
  };

  const handleSave = async () => {
    if (!title.trim()) return toast.error("Le titre est requis");
    setSaving(true);

    try {
      const formationData = {
        title,
        short_description: shortDesc,
        description,
        category,
        level,
        duration,
        price,
        image_url: imageUrl,
        objectives: objectives.split("\n").filter(Boolean),
        is_active: isActive,
      };

      let formationId = id;

      if (isNew) {
        const { data, error } = await supabase.from("formations").insert(formationData).select("id").single();
        if (error) throw error;
        formationId = data.id;
      } else {
        const { error } = await supabase.from("formations").update(formationData).eq("id", id!);
        if (error) throw error;
        // Delete existing modules/lessons then re-create
        await supabase.from("modules").delete().eq("formation_id", id!);
      }

      // Create modules and lessons (upload videos first)
      for (const mod of modules) {
        const { data: modData, error: modErr } = await supabase
          .from("modules")
          .insert({ formation_id: formationId!, title: mod.title, sort_order: mod.sort_order })
          .select("id")
          .single();
        if (modErr) throw modErr;

        if (mod.lessons.length > 0) {
          const lessonsToInsert = [];
          for (const l of mod.lessons) {
            let videoUrl = l.video_url || null;

            // Upload video file if present
            if (l.video_file) {
              const ext = l.video_file.name.split(".").pop();
              const path = `videos/${formationId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
              const { error: upErr } = await supabase.storage.from("course-assets").upload(path, l.video_file);
              if (upErr) throw upErr;
              const { data: urlData } = supabase.storage.from("course-assets").getPublicUrl(path);
              videoUrl = urlData.publicUrl;
            }

            lessonsToInsert.push({
              module_id: modData.id,
              title: l.title,
              duration: l.duration,
              type: l.type,
              video_url: videoUrl,
              sort_order: l.sort_order,
            });
          }
          const { error: lesErr } = await supabase.from("lessons").insert(lessonsToInsert);
          if (lesErr) throw lesErr;
        }
      }

      toast.success(isNew ? "Formation créée !" : "Formation mise à jour !");
      navigate("/admin/formations");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Chargement...</div>;

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="sticky top-0 h-screen w-64 border-r border-border bg-card p-6 hidden md:block">
        <Link to="/" className="mb-8 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-hero">
            <span className="text-lg font-bold text-primary-foreground font-display">K</span>
          </div>
          <span className="text-xl font-bold font-display text-foreground">Expert en King TRC</span>
        </Link>
        <nav className="space-y-1">
          <Link to="/admin" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary">
            <BarChart3 size={18} /> Tableau de bord
          </Link>
          <Link to="/admin/formations" className="flex items-center gap-3 rounded-lg bg-secondary px-3 py-2.5 text-sm font-medium text-foreground">
            <BookOpen size={18} /> Formations
          </Link>
          <Link to="/admin/orders" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary">
            <ShoppingCart size={18} /> Commandes
          </Link>
        </nav>
        <div className="absolute bottom-6 left-6 right-6">
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={() => { signOut(); navigate("/"); }}>
            <LogOut size={16} className="mr-2" /> Déconnexion
          </Button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-8 max-w-4xl">
        <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate("/admin/formations")}>
          <ArrowLeft size={16} className="mr-2" /> Retour
        </Button>

        <h1 className="mb-6 font-display text-2xl font-bold text-foreground">
          {isNew ? "Nouvelle formation" : "Modifier la formation"}
        </h1>

        <div className="space-y-6">
          {/* Basic info */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h2 className="font-display font-semibold text-foreground">Informations générales</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>Titre</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre de la formation" />
              </div>
              <div className="sm:col-span-2">
                <Label>Description courte</Label>
                <Input value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} placeholder="Résumé en une phrase" />
              </div>
              <div className="sm:col-span-2">
                <Label>Description complète</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
              </div>
              <div>
                <Label>Catégorie</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Niveau</Label>
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {levels.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Durée</Label>
                <Input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Ex: 20h" />
              </div>
              <div>
                <Label>Prix (Ar)</Label>
                <Input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
              </div>
              <div className="sm:col-span-2">
                <Label>URL de l'image</Label>
                <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
              </div>
              <div className="sm:col-span-2">
                <Label>Objectifs (un par ligne)</Label>
                <Textarea value={objectives} onChange={(e) => setObjectives(e.target.value)} rows={4} placeholder="Objectif 1&#10;Objectif 2" />
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={isActive} onCheckedChange={setIsActive} />
                <Label>Formation active</Label>
              </div>
            </div>
          </div>

          {/* Modules & Lessons */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-semibold text-foreground">Modules & Leçons</h2>
              <Button variant="outline" size="sm" onClick={addModule}>
                <Plus size={14} className="mr-1" /> Module
              </Button>
            </div>

            {modules.map((mod, mi) => (
              <div key={mi} className="rounded-lg border border-border p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <GripVertical size={16} className="text-muted-foreground" />
                  <Input
                    value={mod.title}
                    onChange={(e) => {
                      const u = [...modules];
                      u[mi].title = e.target.value;
                      setModules(u);
                    }}
                    placeholder={`Module ${mi + 1}`}
                    className="flex-1"
                  />
                  <Button variant="ghost" size="icon" onClick={() => removeModule(mi)}>
                    <Trash2 size={14} className="text-destructive" />
                  </Button>
                </div>

                {mod.lessons.map((les, li) => (
                  <div key={li} className="ml-6 space-y-2 rounded-lg border border-border/50 bg-secondary/30 p-3">
                    <div className="flex items-center gap-2">
                      <Input
                        value={les.title}
                        onChange={(e) => {
                          const u = [...modules];
                          u[mi].lessons[li].title = e.target.value;
                          setModules(u);
                        }}
                        placeholder="Titre de la leçon"
                        className="flex-1"
                      />
                      <Input
                        value={les.duration}
                        onChange={(e) => {
                          const u = [...modules];
                          u[mi].lessons[li].duration = e.target.value;
                          setModules(u);
                        }}
                        placeholder="Durée"
                        className="w-24"
                      />
                      <Button variant="ghost" size="icon" onClick={() => removeLesson(mi, li)}>
                        <Trash2 size={12} className="text-destructive" />
                      </Button>
                    </div>
                    {/* Simple video upload area */}
                    <div className="flex items-center gap-2">
                      <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-accent/30 bg-accent/5 px-4 py-3 text-sm text-muted-foreground hover:border-accent/60 hover:bg-accent/10 transition-colors">
                        <Upload size={18} className="text-accent" />
                        {les.video_file ? (
                          <span className="text-foreground font-medium">{les.video_file.name}</span>
                        ) : les.video_url ? (
                          <span className="text-success flex items-center gap-1"><Video size={14} /> Vidéo ajoutée ✓</span>
                        ) : (
                          <span>Cliquer pour ajouter une vidéo</span>
                        )}
                        <input
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const u = [...modules];
                              u[mi].lessons[li].video_file = file;
                              setModules(u);
                            }
                          }}
                        />
                      </label>
                    </div>
                    {les.video_url && !les.video_file && (
                      <p className="text-xs text-muted-foreground truncate">URL: {les.video_url}</p>
                    )}
                  </div>
                ))}

                <Button variant="ghost" size="sm" className="ml-6 text-accent" onClick={() => addLesson(mi)}>
                  <Plus size={14} className="mr-1" /> Leçon
                </Button>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={saving} className="gradient-accent text-accent-foreground border-0">
              <Save size={16} className="mr-2" /> {saving ? "Enregistrement..." : "Enregistrer"}
            </Button>
            <Button variant="outline" onClick={() => navigate("/admin/formations")}>Annuler</Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FormationEdit;
