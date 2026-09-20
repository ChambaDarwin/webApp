// src/components/PostCard.tsx
import { useEffect, useMemo, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase/config";
import type { Post, UsuarioApp } from "../types";
import { nombreBarrio } from "../config/barrios";
import CommentSection from "./CommentSection";

type TipoReaccion = "like" | "love";

interface ReaccionDoc {
  id: string;
  postId: string;
  uid: string;
  nombre: string;
  tipo: TipoReaccion;
  creadoEn: number;
}

const REACCIONES: Record<
  TipoReaccion,
  { emoji: string; label: string; color: string }
> = {
  like: { emoji: "👍", label: "Me gusta", color: "#2563eb" },
  love: { emoji: "❤️", label: "Me encanta", color: "#dc2626" },
};

function tiempoRelativo(timestamp: number): string {
  const segundos = Math.floor((Date.now() - timestamp) / 1000);
  if (segundos < 60) return "Ahora";
  const minutos = Math.floor(segundos / 60);
  if (minutos < 60) return `${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `${horas} h`;
  const dias = Math.floor(horas / 24);
  if (dias < 30) return `${dias} d`;
  const meses = Math.floor(dias / 30);
  if (meses < 12) return `${meses} mes${meses === 1 ? "" : "es"}`;
  const anios = Math.floor(meses / 12);
  return `${anios} año${anios === 1 ? "" : "s"}`;
}

interface Props {
  post: Post;
  usuario: UsuarioApp | null;
}

export default function PostCard({ post, usuario }: Props) {
  const [reacciones, setReacciones] = useState<ReaccionDoc[]>([]);
  const [totalComentarios, setTotalComentarios] = useState(0);
  const [mostrarComentarios, setMostrarComentarios] = useState(false);
  const [expandido, setExpandido] = useState(false);
  const [popoverAbierto, setPopoverAbierto] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);

  // Reacciones del post (colección aparte, no toca el resto del esquema).
  useEffect(() => {
    const q = query(collection(db, "reacciones"), where("postId", "==", post.id));
    const unsub = onSnapshot(q, (snap) => {
      setReacciones(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as ReaccionDoc[]);
    });
    return () => unsub();
  }, [post.id]);

  // Solo para mostrar el contador "N comentarios" en la barra superior.
  useEffect(() => {
    const q = query(collection(db, "comentarios"), where("postId", "==", post.id));
    const unsub = onSnapshot(q, (snap) => setTotalComentarios(snap.size));
    return () => unsub();
  }, [post.id]);

  const miReaccion = useMemo(
    () => (usuario ? reacciones.find((r) => r.uid === usuario.uid) ?? null : null),
    [reacciones, usuario]
  );

  const conteoPorTipo = useMemo(() => {
    const conteo: Record<TipoReaccion, number> = { like: 0, love: 0 };
    reacciones.forEach((r) => {
      if (r.tipo === "like" || r.tipo === "love") conteo[r.tipo]++;
    });
    return conteo;
  }, [reacciones]);

  const totalReacciones = reacciones.length;
  const tiposPresentes = (Object.keys(REACCIONES) as TipoReaccion[]).filter(
    (t) => conteoPorTipo[t] > 0
  );

  const reaccionar = async (tipo: TipoReaccion) => {
    setPopoverAbierto(false);
    if (!usuario) {
      window.alert("Ingresa con Google para reaccionar a esta publicación.");
      return;
    }
    const idReaccion = `${post.id}_${usuario.uid}`;
    if (miReaccion?.tipo === tipo) {
      await deleteDoc(doc(db, "reacciones", idReaccion));
      return;
    }
    await setDoc(doc(db, "reacciones", idReaccion), {
      postId: post.id,
      uid: usuario.uid,
      nombre: usuario.nombre,
      tipo,
      creadoEn: Date.now(),
    });
  };

  const compartir = () => {
    window.alert(
      "Podrás compartir el enlace de esta publicación cuando el sitio esté disponible en línea."
    );
  };

  const descripcionLarga = post.descripcion.length > 220;
  const descripcionMostrada =
    !descripcionLarga || expandido
      ? post.descripcion
      : post.descripcion.slice(0, 220).trimEnd() + "…";

  return (
    <article className="mb-5 rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4 shadow-[0_4px_16px_rgba(15,118,110,0.12)] transition-shadow last:mb-0 hover:shadow-[0_6px_22px_rgba(15,118,110,0.2)] sm:p-6">
      {/* Encabezado estilo LinkedIn: foto a la izquierda; nombre, cargo y tiempo
          a su derecha, a la altura de la foto. Se usan <div> y no <p> porque Bootstrap
          agrega margen inferior a los <p> y separa las líneas. */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-lg font-semibold text-white sm:h-14 sm:w-14 sm:text-xl">
          {post.autorNombre.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold leading-tight text-[var(--ink)] sm:text-[15px]">
            {post.autorNombre}
          </div>
          <div className="truncate text-xs leading-tight text-[var(--ink-muted)]">
            Administrador · {nombreBarrio(post.barrio)}
          </div>
          <div className="truncate text-xs leading-tight text-[var(--ink-muted)]">
            {tiempoRelativo(post.creadoEn)}
            {post.editadoEn ? " · Editado" : ""} · 🌐
          </div>
        </div>
      </div>

      {/* Cuerpo */}
      <div className="mt-3">
        <h3 className="text-base font-semibold text-[var(--ink)]">
          {post.titulo}
        </h3>
        <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-[var(--ink)]">
          {descripcionMostrada}
          {descripcionLarga && !expandido && (
            <button
              onClick={() => setExpandido(true)}
              className="ml-1 font-medium text-[var(--ink-muted)] hover:text-[var(--accent)]"
            >
              más
            </button>
          )}
        </p>
      </div>

      {post.imagenes.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-1 sm:grid-cols-3">
          {post.imagenes.map((url, i) => (
            <img
              key={i}
              src={url}
              alt={`${post.titulo} - imagen ${i + 1}`}
              className="h-36 w-full object-cover sm:h-40"
              loading="lazy"
            />
          ))}
        </div>
      )}

      {/* Resumen de reacciones y comentarios */}
      {(totalReacciones > 0 || totalComentarios > 0) && (
        <div className="mt-3 flex items-center justify-between text-xs text-[var(--ink-muted)]">
          {totalReacciones > 0 ? (
            <button
              onClick={() => setModalAbierto(true)}
              className="flex items-center gap-1.5 hover:underline"
            >
              <span className="flex -space-x-1">
                {tiposPresentes.map((t) => (
                  <span
                    key={t}
                    className="flex h-4 w-4 items-center justify-center rounded-full text-[10px] ring-2 ring-[var(--bg)]"
                    style={{ backgroundColor: REACCIONES[t].color }}
                  >
                    <span className="scale-90">{REACCIONES[t].emoji}</span>
                  </span>
                ))}
              </span>
              <span>{totalReacciones}</span>
            </button>
          ) : (
            <span />
          )}

          {totalComentarios > 0 && (
            <button
              onClick={() => setMostrarComentarios(true)}
              className="hover:underline"
            >
              {totalComentarios} comentario{totalComentarios === 1 ? "" : "s"}
            </button>
          )}
        </div>
      )}

      {/* Acciones: Me gusta (con selector Me gusta / Me encanta), Comentar, Compartir */}
      <div className="mt-2 grid grid-cols-3 gap-1 sm:grid-cols-[1.5fr_1fr_1fr] border-t border-[var(--line)] pt-1">
        <div className="relative flex items-center">
          {popoverAbierto && (
            <>
              {/* Capa invisible: al tocar fuera se cierra el selector (útil en móvil) */}
              <div
                className="fixed inset-0 z-[5]"
                onClick={() => setPopoverAbierto(false)}
              />
              <div className="absolute -top-14 left-0 z-10 flex gap-1 rounded-full border border-[var(--line)] bg-[var(--bg)] px-2 py-1.5 shadow-md">
                {(Object.keys(REACCIONES) as TipoReaccion[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => reaccionar(t)}
                    title={REACCIONES[t].label}
                    aria-label={REACCIONES[t].label}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-2xl transition active:scale-125 hover:scale-125"
                  >
                    {REACCIONES[t].emoji}
                  </button>
                ))}
              </div>
            </>
          )}
          <button
            onClick={() => reaccionar(miReaccion ? miReaccion.tipo : "like")}
            style={miReaccion ? { color: REACCIONES[miReaccion.tipo].color } : undefined}
            aria-label={miReaccion ? REACCIONES[miReaccion.tipo].label : "Me gusta"}
            title={miReaccion ? REACCIONES[miReaccion.tipo].label : "Me gusta"}
            className={`flex min-w-0 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded py-2.5 text-sm font-medium transition hover:bg-[var(--bg-soft)] ${
              miReaccion ? "" : "text-[var(--ink-muted)]"
            }`}
          >
            <span className="text-xl sm:text-base">
              {miReaccion ? REACCIONES[miReaccion.tipo].emoji : "👍"}
            </span>
            <span className="hidden sm:inline">
              {miReaccion ? REACCIONES[miReaccion.tipo].label : "Me gusta"}
            </span>
          </button>
          <button
            type="button"
            aria-label="Elegir reacción"
            onClick={() => setPopoverAbierto((v) => !v)}
            className="px-2 py-2.5 text-xs text-[var(--ink-muted)] transition hover:text-[var(--accent)]"
          >
            ▾
          </button>
        </div>

        <button
          onClick={() => setMostrarComentarios((v) => !v)}
          aria-label="Comentar"
          title="Comentar"
          className="flex items-center justify-center gap-2 whitespace-nowrap rounded py-2.5 text-sm font-medium text-[var(--ink-muted)] transition hover:bg-[var(--bg-soft)]"
        >
          <span className="text-xl sm:text-base">💬</span>
          <span className="hidden sm:inline">Comentar</span>
        </button>

        <button
          onClick={compartir}
          aria-label="Compartir"
          title="Compartir"
          className="flex items-center justify-center gap-2 whitespace-nowrap rounded py-2.5 text-sm font-medium text-[var(--ink-muted)] transition hover:bg-[var(--bg-soft)]"
        >
          <span className="text-xl sm:text-base">↗️</span>
          <span className="hidden sm:inline">Compartir</span>
        </button>
      </div>

      {mostrarComentarios && (
        <CommentSection postId={post.id} usuario={usuario} />
      )}

      {/* Modal: pantalla con el detalle de reacciones */}
      {modalAbierto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setModalAbierto(false)}
        >
          <div
            className="max-h-[70vh] w-full max-w-sm overflow-y-auto rounded-xl bg-[var(--bg)] p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-base font-semibold text-[var(--ink)]">
                Reacciones
              </h4>
              <button
                onClick={() => setModalAbierto(false)}
                className="text-xl leading-none text-[var(--ink-muted)] hover:text-[var(--ink)]"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            <div className="mb-4 flex flex-wrap gap-4 border-b border-[var(--line)] pb-3 text-sm">
              <span className="font-medium text-[var(--ink)]">
                Todas · {totalReacciones}
              </span>
              {tiposPresentes.map((t) => (
                <span key={t} className="text-[var(--ink-muted)]">
                  {REACCIONES[t].emoji} {REACCIONES[t].label} · {conteoPorTipo[t]}
                </span>
              ))}
            </div>

            <div className="space-y-3">
              {reacciones
                .slice()
                .sort((a, b) => b.creadoEn - a.creadoEn)
                .map((r) => (
                  <div key={r.id} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-sm font-semibold text-[var(--accent)]">
                      {r.nombre.charAt(0).toUpperCase()}
                    </div>
                    <span className="flex-1 truncate text-sm text-[var(--ink)]">
                      {r.nombre}
                    </span>
                    <span>{REACCIONES[r.tipo]?.emoji ?? "👍"}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}