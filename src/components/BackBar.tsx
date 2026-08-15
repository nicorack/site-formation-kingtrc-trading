import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export function BackBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (pathname === "/") return null;

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };

  return (
    <div className="border-b border-border bg-background/80 backdrop-blur">
      <div className="container mx-auto px-4 py-2">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ArrowLeft size={16} /> Retour
        </button>
      </div>
    </div>
  );
}