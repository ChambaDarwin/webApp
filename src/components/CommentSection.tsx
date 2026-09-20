// src/components/CommentSection.tsx
import { useEffect, useState, FormEvent } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase/config";
import type { Comentario, UsuarioApp } from "../types";

interface Props {
  postId: string;
  usuario: UsuarioApp | null;
}

export default function CommentSection({ postId, usuario }: Props) {
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [texto, setTexto] = useState("");
  const [respondiendoA, setRespondiendoA] = useState<string | null>(null);
  const [textoRespuesta, setTextoRespuesta] = useState("");

  useEffect(() => {
    const q = query(
      collection(db, "comentarios"),
      where("postId", "==", postId),
      orderBy("creadoEn", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Comentario[];
      setComentarios(lista);
    });

    return () => unsubscribe();
  }, [postId]);

  // Solo el autor del comentario puede editarlo o eliminarlo.
  const esAutor = (c: Comentario) => !!usuario && usuario.uid === c.autorId;

  const avisarError = (accion: string) =>
    window.alert(`No se pudo ${accion}. Inténtalo de nuevo.`);

  const enviarComentario = async (e: FormEvent) => {
    e.preventDefault();
    if (!usuario || !texto.trim()) return;

    try {
      await addDoc(collection(db, "comentarios"), {
        postId,
        texto: texto.trim(),
        autorId: usuario.uid,
        autorNombre: usuario.nombre,
        autorFoto: usuario.foto ?? null,
        creadoEn: Date.now(),
        editadoEn: null,
        respuestaA: null,
      });
      setTexto("");
    } catch {
      avisarError("enviar el comentario");
    }
  };

  const enviarRespuesta = async (e: FormEvent, respuestaA: string) => {
    e.preventDefault();
    if (!usuario || !textoRespuesta.trim()) return;

    try {
      await addDoc(collection(db, "comentarios"), {
        postId,
        texto: textoRespuesta.trim(),
        autorId: usuario.uid,
        autorNombre: usuario.nombre,
        autorFoto: usuario.foto ?? null,
        creadoEn: Date.now(),
        editadoEn: null,
        respuestaA,
      });
      setTextoRespuesta("");
      setRespondiendoA(null);
    } catch {
      avisarError("enviar la respuesta");
    }
  };

  const editarComentario = async (comentario: Comentario, nuevoTexto: string) => {
    if (!esAutor(comentario) || comentario.eliminado) return;
    try {
      await updateDoc(doc(db, "comentarios", comentario.id), {
        texto: nuevoTexto.trim(),
        editadoEn: Date.now(),
      });
    } catch {
      avisarError("editar el comentario");
    }
  };

  const eliminarComentario = async (comentario: Comentario) => {
    if (!esAutor(comentario)) return;

    const tieneRespuestas = comentarios.some(
      (c) => c.respuestaA === comentario.id
    );
    const confirmar = window.confirm(
      tieneRespuestas
        ? "Este comentario tiene respuestas de otras personas. Se quitará tu texto, pero las respuestas se conservarán. ¿Continuar?"
        : "¿Eliminar este comentario?"
    );
    if (!confirmar) return;

    try {
      if (tieneRespuestas) {
        // Las respuestas pertenecen a otras personas: no se borran,
        // solo se vacía el comentario del autor.
        await updateDoc(doc(db, "comentarios", comentario.id), {
          texto: "",
          eliminado: true,
          editadoEn: null,
        });
      } else {
        await deleteDoc(doc(db, "comentarios", comentario.id));
      }
    } catch {
      avisarError("eliminar el comentario");
    }
  };

  const principales = comentarios.filter((c) => !c.respuestaA);
  const respuestasDe = (id: string) =>
    comentarios.filter((c) => c.respuestaA === id);

  return (
    <div className="mt-5 border-t border-[var(--line)] pt-4 sm:mt-6 sm:pt-5">
      <h4 className="mb-4 text-sm font-medium text-[var(--ink-muted)]">
        Comentarios ({principales.length})
      </h4>

      <div className="space-y-4">
        {principales.map((c) => (
          <div key={c.id}>
            <ComentarioItem
              comentario={c}
              puedeGestionar={esAutor(c)}
              onResponder={
                usuario
                  ? () => {
                      setRespondiendoA(c.id === respondiendoA ? null : c.id);
                      setTextoRespuesta("");
                    }
                  : undefined
              }
              respondiendoActivo={respondiendoA === c.id}
              onEditar={(nuevoTexto) => editarComentario(c, nuevoTexto)}
              onEliminar={() => eliminarComentario(c)}
            />

            {respuestasDe(c.id).length > 0 && (
              <div className="ml-3 mt-3 space-y-3 border-l border-[var(--line)] pl-3 sm:ml-11 sm:pl-4">
                {respuestasDe(c.id).map((r) => (
                  <ComentarioItem
                    key={r.id}
                    comentario={r}
                    puedeGestionar={esAutor(r)}
                    onEditar={(nuevoTexto) => editarComentario(r, nuevoTexto)}
                    onEliminar={() => eliminarComentario(r)}
                  />
                ))}
              </div>
            )}

            {/* El cuadro de respuesta aparece justo debajo del comentario
                al que se está respondiendo, no al final de toda la lista. */}
            {respondiendoA === c.id && usuario && (
              <form
                onSubmit={(e) => enviarRespuesta(e, c.id)}
                className="ml-3 mt-3 pl-3 sm:ml-11 sm:pl-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    autoFocus
                    value={textoRespuesta}
                    onChange={(e) => setTextoRespuesta(e.target.value)}
                    placeholder={`Responder a ${c.autorNombre}...`}
                    className="min-w-0 flex-1 border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 text-base text-[var(--ink)] outline-none focus:border-[var(--accent)] sm:py-2 sm:text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-[var(--ink)] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--accent)] sm:flex-none sm:py-2"
                    >
                      Responder
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRespondiendoA(null);
                        setTextoRespuesta("");
                      }}
                      className="px-3 py-2.5 text-sm text-[var(--ink-muted)] hover:text-[var(--accent)] sm:py-2"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        ))}
      </div>

      {usuario ? (
        <form onSubmit={enviarComentario} className="mt-5">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Escribe un comentario..."
              className="min-w-0 flex-1 border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 text-base text-[var(--ink)] outline-none focus:border-[var(--accent)] sm:py-2"
            />
            <button
              type="submit"
              className="bg-[var(--ink)] px-4 py-2.5 font-medium text-white transition hover:bg-[var(--accent)] sm:py-2"
            >
              Enviar
            </button>
          </div>
        </form>
      ) : (
        <p className="mt-4 text-sm text-[var(--ink-muted)]">
          Ingresa con Google para comentar.
        </p>
      )}
    </div>
  );
}

function ComentarioItem({
  comentario,
  puedeGestionar,
  onResponder,
  respondiendoActivo,
  onEditar,
  onEliminar,
}: {
  comentario: Comentario;
  /** true solo si el usuario actual es el autor del comentario */
  puedeGestionar: boolean;
  onResponder?: () => void;
  respondiendoActivo?: boolean;
  onEditar: (nuevoTexto: string) => void;
  onEliminar: () => void;
}) {
  const [editando, setEditando] = useState(false);
  const [borrador, setBorrador] = useState(comentario.texto);

  const eliminado = !!comentario.eliminado;

  const guardarEdicion = () => {
    if (!borrador.trim()) return;
    onEditar(borrador);
    setEditando(false);
  };

  return (
    <div className="flex gap-2.5 sm:gap-3">
      {comentario.autorFoto ? (
        <img
          src={comentario.autorFoto}
          alt=""
          className="h-8 w-8 shrink-0 rounded-full"
        />
      ) : (
        <div className="h-8 w-8 shrink-0 rounded-full bg-[var(--bg-soft)]" />
      )}
      <div className="min-w-0 flex-1">
        <p className="break-words text-sm font-medium text-[var(--ink)]">
          {comentario.autorNombre}
          {comentario.editadoEn && !eliminado && (
            <span className="ml-2 text-xs font-normal text-[var(--ink-muted)]">
              (editado)
            </span>
          )}
        </p>

        {editando ? (
          <div className="mt-1">
            <textarea
              autoFocus
              rows={2}
              value={borrador}
              onChange={(e) => setBorrador(e.target.value)}
              className="w-full resize-none border border-[var(--line)] bg-[var(--bg)] px-2.5 py-2 text-base text-[var(--ink)] outline-none focus:border-[var(--accent)] sm:text-sm"
            />
            <div className="mt-1 flex gap-4">
              <button
                onClick={guardarEdicion}
                className="py-1.5 text-xs font-medium text-[var(--accent)] hover:underline"
              >
                Guardar
              </button>
              <button
                onClick={() => {
                  setBorrador(comentario.texto);
                  setEditando(false);
                }}
                className="py-1.5 text-xs text-[var(--ink-muted)] hover:underline"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : eliminado ? (
          <p className="text-sm italic text-[var(--ink-muted)]">
            Este comentario fue eliminado
          </p>
        ) : (
          <p className="whitespace-pre-line break-words text-sm text-[var(--ink-muted)]">
            {comentario.texto}
          </p>
        )}

        {!editando && (
          <div className="mt-0.5 flex flex-wrap gap-x-4">
            {onResponder && (
              <button
                onClick={onResponder}
                className="py-1.5 text-xs text-[var(--accent)] hover:underline"
              >
                {respondiendoActivo ? "Cancelar respuesta" : "Responder"}
              </button>
            )}
            {puedeGestionar && !eliminado && (
              <>
                <button
                  onClick={() => {
                    setBorrador(comentario.texto);
                    setEditando(true);
                  }}
                  className="py-1.5 text-xs text-[var(--ink-muted)] hover:text-[var(--accent)] hover:underline"
                >
                  Editar
                </button>
                <button
                  onClick={onEliminar}
                  className="py-1.5 text-xs text-[var(--ink-muted)] hover:text-red-600 hover:underline"
                >
                  Eliminar
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
