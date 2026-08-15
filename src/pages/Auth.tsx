import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useI18n } from "@/context/LanguageContext";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useI18n();

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` },
    });
    if (error) toast.error(error.message);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Connexion réussie !");
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        if (error) throw error;
        toast.success("Inscription réussie ! Vérifiez votre email.");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-md rounded-xl border border-border bg-card p-8 shadow-card">
            <h1 className="mb-6 text-center font-display text-2xl font-bold text-foreground">
              {isLogin ? t("auth.loginTitle") : t("auth.signupTitle")}
            </h1>

            <Button type="button" variant="outline" className="w-full" onClick={handleGoogle}>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.2-2.2H12v4.2h6.6c-.1 1.1-.8 2.8-2.4 3.9l-.1.1 3.6 2.8.2.1c2.3-2.1 3.6-5.2 3.6-8.9z" />
                <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.8-2.9c-1 .7-2.4 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5l-.1.1-3.7 2.9.1.1C3.6 21.3 7.5 24 12 24z" />
                <path fill="#FBBC05" d="M5.3 14.4c-.2-.7-.4-1.5-.4-2.4s.1-1.6.4-2.4V9.5L1.4 6.6l-.1.1C.5 8.3 0 10.1 0 12s.5 3.7 1.3 5.3l4-2.9z" />
                <path fill="#EA4335" d="M12 4.7c2.2 0 3.7.9 4.6 1.7l3.3-3.3C17.9 1.2 15.2 0 12 0 7.5 0 3.6 2.7 1.3 6.7l4 2.9C6.2 6.8 8.9 4.7 12 4.7z" />
              </svg>
              {t("auth.google")}
            </Button>

            <div className="my-5 flex items-center gap-3 text-xs uppercase text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> {t("auth.or")} <span className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <Label htmlFor="name">{t("auth.fullName")}</Label>
                  <Input
                    id="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Votre nom"
                    required
                  />
                </div>
              )}
              <div>
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">{t("auth.password")}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full gradient-accent text-accent-foreground border-0" disabled={loading}>
                {loading ? "Chargement..." : isLogin ? t("auth.submitLogin") : t("auth.submitSignup")}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              {isLogin ? t("auth.noAccount") : t("auth.hasAccount")}{" "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-accent font-medium hover:underline"
              >
                {isLogin ? t("auth.submitSignup") : t("auth.submitLogin")}
              </button>
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Auth;
