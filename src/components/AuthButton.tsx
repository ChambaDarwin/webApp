// src/components/AuthButton.tsx
import { iniciarSesionConGoogle, cerrarSesion } from "../firebase/config";
import type { UsuarioApp } from "../types";

interface Props {
  usuario: UsuarioApp | null;
  variante?: "hero" | "compacta";
}

export default function AuthButton({ usuario, variante = "hero" }: Props) {
  const manejarClick = async () => {
    try {
      if (usuario) {
        await cerrarSesion();
      } else {
        await iniciarSesionConGoogle();
      }
    } catch (error) {
      console.error("Error de autenticación:", error);
    }
  };

  if (variante === "compacta") {
    return (
      <button
        onClick={manejarClick}
        className="flex items-center gap-2 border border-[var(--line)] px-4 py-2 text-sm text-[var(--ink)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
      >
        {usuario ? (
          <>
            {usuario.foto && (
              <img src={usuario.foto} alt="" className="h-6 w-6 rounded-full" />
            )}
            Salir
          </>
        ) : (
          "Ingresar con Google"
        )}
      </button>
    );
  }

  return (
    <button
      onClick={manejarClick}
      className="w-full bg-[var(--ink)] px-8 py-3.5 text-base font-medium text-white transition hover:bg-[var(--accent)] sm:w-auto"
    >
      {usuario ? "Ver estado del proyecto" : "Ingresar con Google"}
    </button>
  );
}
