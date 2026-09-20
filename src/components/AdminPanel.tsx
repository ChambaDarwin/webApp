// src/components/AdminPanel.tsx
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import AdminPostForm from "./AdminPostForm";
import AdminPostList from "./AdminPostList";
import { nombreBarrio } from "../config/barrios";
import type { Post } from "../types";

interface Props {
  onVolver: () => void;
}

type Pestana = "publicar" | "publicaciones";

export default function AdminPanel({ onVolver }: Props) {
  const { usuario, cargando } = useAuth();
  const [pestana, setPestana] = useState<Pestana>("publicar");
  const [postEditando, setPostEditando] = useState<Post | null>(null);

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] text-[var(--ink-muted)]">
        Cargando...
      </div>
    );
  }

  if (!usuario?.esAdmin || !usuario.barrioAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--bg)] text-[var(--ink)]">
        <p>No tienes permisos de administrador.</p>
        <button onClick={onVolver} className="text-[var(--accent)] underline">
          Volver
        </button>
      </div>
    );
  }

  const barrio = usuario.barrioAdmin;

  const irAPublicar = () => {
    setPostEditando(null);
    setPestana("publicar");
  };

  const editarPost = (post: Post) => {
    setPostEditando(post);
    setPestana("publicar");
  };

  const alTerminarFormulario = () => {
    const fueEdicion = !!postEditando;
    setPostEditando(null);
    if (fueEdicion) {
      // Al editar, quédate en el panel viendo la lista actualizada.
      setPestana("publicaciones");
    } else {
      // Al crear un post, el pedido explícito es volver al sitio de inmediato,
      // sin tener que presionar "Volver al sitio".
      onVolver();
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] px-6 py-10 sm:px-10">
      <div className="mx-auto mb-6 flex max-w-xl items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--ink)]">
            Panel de administrador
          </h1>
          <p className="mt-0.5 text-sm text-[var(--ink-muted)]">
            {nombreBarrio(barrio)}
          </p>
        </div>
        <button
          onClick={onVolver}
          className="text-sm text-[var(--ink-muted)] hover:text-[var(--accent)]"
        >
          Volver al sitio
        </button>
      </div>

      <div className="mx-auto mb-8 flex max-w-xl gap-2 border-b border-[var(--line)]">
        <button
          onClick={irAPublicar}
          className={`px-4 py-2.5 text-sm font-medium transition ${
            pestana === "publicar"
              ? "border-b-2 border-[var(--accent)] text-[var(--accent)]"
              : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
          }`}
        >
          {postEditando ? "Editar publicación" : "Nueva publicación"}
        </button>
        <button
          onClick={() => {
            setPostEditando(null);
            setPestana("publicaciones");
          }}
          className={`px-4 py-2.5 text-sm font-medium transition ${
            pestana === "publicaciones"
              ? "border-b-2 border-[var(--accent)] text-[var(--accent)]"
              : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
          }`}
        >
          Mis publicaciones
        </button>
      </div>

      {pestana === "publicar" ? (
        <AdminPostForm
          key={postEditando?.id ?? "nuevo"}
          postExistente={postEditando}
          onExito={alTerminarFormulario}
          onCancelar={
            postEditando ? () => setPestana("publicaciones") : undefined
          }
        />
      ) : (
        <AdminPostList barrio={barrio} onEditar={editarPost} />
      )}
    </div>
  );
}
