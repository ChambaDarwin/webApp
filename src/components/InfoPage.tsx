// src/components/InfoPage.tsx
import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../hooks/useAuth";
import { useNotificaciones } from "../hooks/useNotificaciones";
import { useBarrioSeleccionado } from "../hooks/useBarrioSeleccionado";
import { nombreBarrio } from "../config/barrios";
import { CONTENIDO_BARRIOS } from "../config/contenidoBarrios";

import AuthButton from "./AuthButton";
import NotificationBell from "./NotificationBell";
import BarrioSelector from "./BarrioSelector";
import PostCard from "./PostCard";
import Footer from "./Footer";
import type { Post } from "../types";
import { InfoBarrio } from "./InfoBarrio";

interface Props {
  onIrAAdmin: () => void;
}

export default function InfoPage({ onIrAAdmin }: Props) {
  const { usuario } = useAuth();
  const { barrio, setBarrio } = useBarrioSeleccionado(usuario);
  const [posts, setPosts] = useState<Post[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("creadoEn", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];
      setPosts(lista);
      setCargando(false);
    });
    return () => unsubscribe();
  }, []);

  // Solo se muestran al público los posts del barrio seleccionado
  // que además no han vencido.
  const postsVigentes = posts.filter(
    (p) => p.barrio === barrio && p.expiraEn > Date.now()
  );
  const { nuevos, marcarComoVistas } = useNotificaciones(postsVigentes);
  const estado = CONTENIDO_BARRIOS[barrio].estado;

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <nav className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] px-6 py-4 sm:px-10">
        <span className="text-base font-semibold text-[var(--ink)]">
          Proyecto Escalón 1
        </span>
        <div className="flex flex-wrap items-center gap-3">
          <BarrioSelector barrio={barrio} onCambiar={setBarrio} />
          <NotificationBell nuevos={nuevos} onAbrir={marcarComoVistas} />
          {usuario?.esAdmin && (
            <button
              onClick={onIrAAdmin}
              className="border border-[var(--ink)] px-4 py-2 text-sm text-[var(--ink)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              Panel de administrador
            </button>
          )}
          <AuthButton usuario={usuario} variante="compacta" />
        </div>
      </nav>

      <section className="mx-auto max-w-3xl px-6 py-16 text-center sm:px-10">
        <p className="text-sm text-[var(--accent)]">
          Estado del proyecto · {nombreBarrio(barrio)}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--ink)] sm:text-5xl">
          {estado.titulo}
        </h1>
        <p className="mx-auto mt-5 max-w-xl leading-relaxed text-[var(--ink-muted)]">
          {estado.descripcion}
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-20 sm:px-10">
        {cargando && (
          <p className="text-center text-[var(--ink-muted)]">
            Cargando publicaciones...
          </p>
        )}
        {!cargando && postsVigentes.length === 0 && (
          <p className="text-center text-[var(--ink-muted)]">
            Aún no hay publicaciones vigentes sobre el estado del proyecto en{" "}
            {nombreBarrio(barrio)}.
          </p>
        )}
        {postsVigentes.map((post) => (
          <PostCard key={post.id} post={post} usuario={usuario} />
        ))}
      </section>

      <section>
        <InfoBarrio barrio={barrio} />
      </section>

      <Footer />
    </div>
  );
}
