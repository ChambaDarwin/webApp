// src/components/AdminPostForm.tsx
import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { subirImagenPost } from "../supabase/config";
import { useAuth } from "../hooks/useAuth";
import type { Post } from "../types";
import { nombreBarrio } from "../config/barrios";

const DIA_EN_MS = 24 * 60 * 60 * 1000;

interface ArchivoConPreview {
  archivo: File;
  previewUrl: string;
}

interface Props {
  // Si se pasa, el formulario edita este post en lugar de crear uno nuevo.
  postExistente?: Post | null;
  // Se llama cuando termina de crear o editar con éxito (para volver atrás
  // automáticamente sin que el usuario tenga que presionar nada).
  onExito: () => void;
  onCancelar?: () => void;
}

export default function AdminPostForm({
  postExistente,
  onExito,
  onCancelar,
}: Props) {
  const { usuario } = useAuth();
  const esEdicion = !!postExistente;
  const barrioAdminNombre = usuario?.barrioAdmin
    ? nombreBarrio(usuario.barrioAdmin)
    : null;

  const [titulo, setTitulo] = useState(postExistente?.titulo ?? "");
  const [descripcion, setDescripcion] = useState(
    postExistente?.descripcion ?? ""
  );
  const [imagenesExistentes, setImagenesExistentes] = useState<string[]>(
    postExistente?.imagenes ?? []
  );
  const [archivos, setArchivos] = useState<ArchivoConPreview[]>([]);
  const [duracionDias, setDuracionDias] = useState(
    postExistente?.duracionDias ?? 3
  );
  const [subiendo, setSubiendo] = useState(false);
  const [progreso, setProgreso] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<{
    tipo: "ok" | "error";
    texto: string;
  } | null>(null);

  useEffect(() => {
    return () => {
      archivos.forEach((a) => URL.revokeObjectURL(a.previewUrl));
    };
  }, [archivos]);

  const manejarArchivos = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const nuevos = Array.from(e.target.files).map((archivo) => ({
        archivo,
        previewUrl: URL.createObjectURL(archivo),
      }));
      setArchivos((prev) => [...prev, ...nuevos]);
    }
    e.target.value = "";
  };

  const quitarArchivoNuevo = (indice: number) => {
    setArchivos((prev) => {
      URL.revokeObjectURL(prev[indice].previewUrl);
      return prev.filter((_, i) => i !== indice);
    });
  };

  const quitarImagenExistente = (indice: number) => {
    setImagenesExistentes((prev) => prev.filter((_, i) => i !== indice));
  };

  const guardar = async (e: FormEvent) => {
    e.preventDefault();
    if (!usuario || !usuario.barrioAdmin || !titulo.trim() || !descripcion.trim())
      return;
    const barrioAdmin = usuario.barrioAdmin;

    setSubiendo(true);
    setMensaje(null);

    try {
      const urlsNuevas: string[] = [];
      for (let i = 0; i < archivos.length; i++) {
        const { archivo } = archivos[i];
        setProgreso(`Subiendo imagen ${i + 1} de ${archivos.length}...`);
        const url = await subirImagenPost(archivo);
        if (!url) {
          throw new Error(
            `subirImagenPost devolvió un valor vacío para "${archivo.name}"`
          );
        }
        urlsNuevas.push(url);
      }
      setProgreso(null);

      const imagenesFinales = [...imagenesExistentes, ...urlsNuevas];
      const duracion = Math.max(1, duracionDias);

      if (esEdicion && postExistente) {
        await updateDoc(doc(db, "posts", postExistente.id), {
          titulo: titulo.trim(),
          descripcion: descripcion.trim(),
          imagenes: imagenesFinales,
          duracionDias: duracion,
          expiraEn: postExistente.creadoEn + duracion * DIA_EN_MS,
          editadoEn: Date.now(),
        });
        setMensaje({ tipo: "ok", texto: "Publicación actualizada." });
      } else {
        const creadoEn = Date.now();
        await addDoc(collection(db, "posts"), {
          barrio: barrioAdmin,
          titulo: titulo.trim(),
          descripcion: descripcion.trim(),
          imagenes: imagenesFinales,
          autorId: usuario.uid,
          autorNombre: usuario.nombre,
          creadoEn,
          editadoEn: null,
          duracionDias: duracion,
          expiraEn: creadoEn + duracion * DIA_EN_MS,
        });
        setMensaje({ tipo: "ok", texto: "Publicación creada correctamente." });
      }

      archivos.forEach((a) => URL.revokeObjectURL(a.previewUrl));

      // Volver atrás automáticamente, sin que el usuario tenga que presionar nada.
      setTimeout(() => onExito(), 700);
    } catch (error) {
      console.error("[guardar post] error:", error);
      setMensaje({
        tipo: "error",
        texto:
          error instanceof Error
            ? `Error: ${error.message}`
            : "Ocurrió un error al guardar. Intenta de nuevo.",
      });
    } finally {
      setSubiendo(false);
      setProgreso(null);
    }
  };

  return (
    <form
      onSubmit={guardar}
      className="mx-auto max-w-xl space-y-6 border border-[var(--line)] bg-[var(--bg)] p-6 sm:p-8"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--ink)]">
          {esEdicion ? "Editar publicación" : "Nueva publicación"}
        </h2>
        {barrioAdminNombre && (
          <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-medium text-[var(--accent)]">
            {barrioAdminNombre}
          </span>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm text-[var(--ink-muted)]">
          Título
        </label>
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
          placeholder="Ej. Nuevo tramo intervenido en la calle 10 de Agosto"
          className="w-full border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 text-[var(--ink)] outline-none transition focus:border-[var(--accent)]"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm text-[var(--ink-muted)]">
          Descripción
        </label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          required
          rows={5}
          placeholder="Describe el riesgo, la ubicación exacta y las recomendaciones para la ciudadanía."
          className="w-full resize-none border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 text-[var(--ink)] outline-none transition focus:border-[var(--accent)]"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm text-[var(--ink-muted)]">
          Días visible al público
        </label>
        <input
          type="number"
          min={1}
          max={90}
          value={duracionDias}
          onChange={(e) => setDuracionDias(Number(e.target.value))}
          className="w-28 border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 text-[var(--ink)] outline-none transition focus:border-[var(--accent)]"
        />
        <p className="mt-1.5 text-xs text-[var(--ink-muted)]">
          El post se oculta automáticamente del listado público al cumplirse
          este plazo.
        </p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm text-[var(--ink-muted)]">
          Imágenes
        </label>

        {imagenesExistentes.length > 0 && (
          <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {imagenesExistentes.map((url, i) => (
              <div
                key={url}
                className="group relative aspect-square overflow-hidden border border-[var(--line)] bg-[var(--bg-soft)]"
              >
                <img src={url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => quitarImagenExistente(i)}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-xs text-white opacity-0 transition group-hover:opacity-100"
                  aria-label="Quitar imagen"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={manejarArchivos}
          className="w-full text-sm text-[var(--ink-muted)] file:mr-3 file:border file:border-[var(--line)] file:bg-[var(--bg-soft)] file:px-3 file:py-1.5 file:text-sm file:text-[var(--ink)]"
        />

        {archivos.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {archivos.map((item, i) => (
              <div
                key={`${item.archivo.name}-${i}`}
                className="group relative aspect-square overflow-hidden border border-[var(--line)] bg-[var(--bg-soft)]"
              >
                <img
                  src={item.previewUrl}
                  alt={item.archivo.name}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => quitarArchivoNuevo(i)}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-xs text-white opacity-0 transition group-hover:opacity-100"
                  aria-label={`Quitar ${item.archivo.name}`}
                >
                  ×
                </button>
                <span className="absolute inset-x-0 bottom-0 truncate bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                  {item.archivo.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={subiendo}
          className="flex-1 bg-[var(--accent)] py-3 font-medium text-white transition hover:brightness-110 disabled:opacity-50"
        >
          {subiendo
            ? progreso ?? "Guardando..."
            : esEdicion
            ? "Guardar cambios"
            : "Publicar"}
        </button>
        {onCancelar && (
          <button
            type="button"
            onClick={onCancelar}
            className="border border-[var(--line)] px-5 py-3 text-sm text-[var(--ink-muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            Cancelar
          </button>
        )}
      </div>

      {mensaje && (
        <p
          className={
            mensaje.tipo === "ok"
              ? "text-sm text-[var(--accent)]"
              : "text-sm text-red-600"
          }
        >
          {mensaje.texto}
        </p>
      )}
    </form>
  );
}
