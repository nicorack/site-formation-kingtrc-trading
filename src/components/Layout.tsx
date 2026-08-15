import { Header } from "./Header";
import { Footer } from "./Footer";
import { BackBar } from "./BackBar";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <BackBar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
