import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Shield, BookOpen, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/context/LanguageContext";
import { PreferencesToggle } from "@/components/PreferencesToggle";
import { SITE } from "@/lib/site";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();
  const { t } = useI18n();

  const navLinks = [
    { label: t("nav.home"), href: "/" },
    { label: t("nav.formations"), href: "/formations" },
    { label: t("nav.about"), href: "/a-propos" },
    { label: t("nav.contact"), href: "/contact" },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const linkClass = (active: boolean) =>
    `rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary ${
      active ? "text-accent font-semibold" : "text-muted-foreground"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-hero">
            <span className="text-lg font-bold text-primary-foreground font-display">K</span>
          </div>
          <span className="text-xl font-bold font-display text-foreground">Expert en King TRC</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <Link key={link.href} to={link.href} className={linkClass(location.pathname === link.href)}>
              {link.label}
            </Link>
          ))}
          <a
            href={SITE.journal}
            target="_blank"
            rel="noopener noreferrer"
            className={`${linkClass(false)} inline-flex items-center gap-1`}
          >
            {t("nav.journal")} <ExternalLink size={12} />
          </a>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <PreferencesToggle />
          {user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/mes-formations"><BookOpen size={14} className="mr-1" /> {t("nav.myCourses")}</Link>
              </Button>
              {isAdmin && (
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/admin"><Shield size={14} className="mr-1" /> {t("nav.admin")}</Link>
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                {t("nav.logout")}
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth">{t("nav.login")}</Link>
              </Button>
              <Button size="sm" className="gradient-accent text-accent-foreground border-0 shadow-md hover:opacity-90" asChild>
                <Link to="/auth">{t("nav.signup")}</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-1 lg:hidden">
          <PreferencesToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-md hover:bg-secondary text-foreground"
            aria-label="Menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-border bg-card lg:hidden"
          >
            <nav className="flex flex-col gap-1 p-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-secondary ${
                    location.pathname === link.href
                      ? "text-accent font-semibold bg-secondary"
                      : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <a
                href={SITE.journal}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center gap-1 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary"
              >
                {t("nav.journal")} <ExternalLink size={12} />
              </a>
              <div className="mt-3 flex flex-col gap-2">
                {user ? (
                  <>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/mes-formations" onClick={() => setMobileOpen(false)}>
                        <BookOpen size={14} className="mr-1" /> {t("nav.myCourses")}
                      </Link>
                    </Button>
                    {isAdmin && (
                      <Button variant="outline" size="sm" asChild>
                        <Link to="/admin" onClick={() => setMobileOpen(false)}>
                          <Shield size={14} className="mr-1" /> {t("nav.admin")}
                        </Link>
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => { handleSignOut(); setMobileOpen(false); }}>
                      {t("nav.logout")}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/auth" onClick={() => setMobileOpen(false)}>{t("nav.login")}</Link>
                    </Button>
                    <Button size="sm" className="gradient-accent text-accent-foreground border-0" asChild>
                      <Link to="/auth" onClick={() => setMobileOpen(false)}>{t("nav.signup")}</Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
