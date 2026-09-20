// src/App.tsx
import { useState } from "react";
import { useAuth } from "./hooks/useAuth";
import LandingPage from "./components/LandingPage";
import InfoPage from "./components/InfoPage";
import AdminPanel from "./components/AdminPanel";

type Vista = "info" | "admin";

export default function App() {
  const { usuario, cargando } = useAuth();
  const [vista, setVista] = useState<Vista>("info");

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] text-[var(--ink-muted)]">
        Cargando...
      </div>
    );
  }

  if (!usuario) {
    return <LandingPage usuario={usuario} />;
  }

  if (vista === "admin") {
    return <AdminPanel onVolver={() => setVista("info")} />;
  }

  return <InfoPage onIrAAdmin={() => setVista("admin")} />;
}
