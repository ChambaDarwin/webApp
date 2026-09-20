// src/components/AdminPostList.tsx
import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { Alert, Button, Modal, Spinner } from "react-bootstrap";
import { db } from "../firebase/config";
import { eliminarImagenesPost } from "../supabase/config";
import type { BarrioSlug } from "../config/barrios";
import type { Post } from "../types";

interface Props {
  barrio: BarrioSlug;
  onEditar: (post: Post) => void;
}

export default function AdminPostList({ barrio, onEditar }: Props) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorLista, setErrorLista] = useState<string | null>(null);
  // Modal de confirmación para eliminar una publicación
  const [postAEliminar, setPostAEliminar] = useState<Post | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);

  useEffect(() => {
    // Solo se filtra por barrio: combinar where + orderBy en campos distintos
    // exige un índice compuesto en Firebase. El orden se aplica aquí abajo.
    const q = query(collection(db, "posts"), where("barrio", "==", barrio));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const lista = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Post[];
        lista.sort((a, b) => b.creadoEn - a.creadoEn); // más recientes primero
        setPosts(lista);
        setErrorLista(null);
        setCargando(false);
      },
      (error) => {
        // Si la escucha falla, la lista deja de actualizarse sola: lo avisamos.
        console.error("[AdminPostList] error en la escucha:", error);
        setErrorLista(
          `No se pudo actualizar la lista (${error.code}). Recarga la página.`,
        );
        setCargando(false);
      },
    );
    return () => unsubscribe();
  }, [barrio]);

  const pedirConfirmacion = (post: Post) => {
    setPostAEliminar(post);
    setErrorEliminar(null);
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    if (eliminando) return; // no cerrar mientras se está borrando
    setMostrarModal(false);
  };

  const confirmarEliminacion = async () => {
    if (!postAEliminar) return;

    setEliminando(true);
    setErrorEliminar(null);
    try {
      // Si el post ya no existe (por ejemplo se borró en un intento anterior),
      // no hay nada que borrar: solo se quita de la lista. Intentar borrar un
      // documento inexistente lo rechazan las reglas con permission-denied.
      const postSnap = await getDoc(doc(db, "posts", postAEliminar.id));
      if (!postSnap.exists()) {
        setPosts((prev) => prev.filter((p) => p.id !== postAEliminar.id));
        setMostrarModal(false);
        return;
      }

      // Borrado en cascada: comentarios y reacciones del post y, al final, el
      // post. El post va siempre en el último lote (Firestore permite 500
      // operaciones por lote) para no dejar un post sin comentarios ni
      // reacciones si algo falla antes.
      const [comentariosSnap, reaccionesSnap] = await Promise.all([
        getDocs(
          query(
            collection(db, "comentarios"),
            where("postId", "==", postAEliminar.id),
          ),
        ),
        getDocs(
          query(
            collection(db, "reacciones"),
            where("postId", "==", postAEliminar.id),
          ),
        ),
      ]);
      const refs = [
        ...comentariosSnap.docs.map((c) => c.ref),
        ...reaccionesSnap.docs.map((r) => r.ref),
        doc(db, "posts", postAEliminar.id),
      ];
      for (let i = 0; i < refs.length; i += 400) {
        const batch = writeBatch(db);
        refs.slice(i, i + 400).forEach((r) => batch.delete(r));
        await batch.commit();
      }

      // Las imágenes viven en Supabase. Ya se borró todo en Firestore, así que
      // si esto falla no se cancela nada: solo se avisa en consola.
      try {
        await eliminarImagenesPost(postAEliminar.imagenes ?? []);
      } catch (errorImagenes) {
        console.warn(
          "[eliminarPost] no se pudieron borrar las imágenes:",
          errorImagenes,
        );
      }

      // Quita el post de la lista al instante, sin esperar a la escucha en tiempo real.
      setPosts((prev) => prev.filter((p) => p.id !== postAEliminar.id));
      setMostrarModal(false);
    } catch (error) {
      console.error("[eliminarPost] error:", error);
      const codigo = (error as { code?: string }).code;
      setErrorEliminar(
        codigo
          ? `No se pudo eliminar la publicación (${codigo}).`
          : "No se pudo eliminar la publicación.",
      );
    } finally {
      setEliminando(false);
    }
  };

  if (cargando) {
    return (
      <p className="text-center text-sm text-[var(--ink-muted)]">
        Cargando publicaciones...
      </p>
    );
  }

  if (errorLista && posts.length === 0) {
    return <p className="text-center text-sm text-red-600">{errorLista}</p>;
  }

  if (posts.length === 0) {
    return (
      <p className="text-center text-sm text-[var(--ink-muted)]">
        Aún no tienes publicaciones en este barrio.
      </p>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-xl space-y-3">
        {errorLista && (
          <p className="text-center text-sm text-red-600">{errorLista}</p>
        )}
        {posts.map((post) => {
          const vencido = post.expiraEn <= Date.now();
          return (
            <div
              key={post.id}
              className="flex items-start justify-between gap-4 border border-[var(--line)] bg-[var(--bg)] p-4"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-[var(--ink)]">
                  {post.titulo}
                </p>
                <p className="mt-1 text-xs text-[var(--ink-muted)]">
                  {new Date(post.creadoEn).toLocaleDateString("es-EC", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                  {" · "}
                  {vencido ? (
                    <span className="text-red-600">vencido</span>
                  ) : (
                    <span className="text-[var(--accent)]">vigente</span>
                  )}
                  {post.editadoEn ? " · editado" : ""}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => onEditar(post)}
                  className="border border-[var(--line)] px-3 py-1.5 text-xs text-[var(--ink)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  Editar
                </button>
                <button
                  onClick={() => pedirConfirmacion(post)}
                  className="border border-red-200 px-3 py-1.5 text-xs text-red-600 transition hover:border-red-500"
                >
                  Eliminar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        show={mostrarModal}
        onHide={cerrarModal}
        centered
        backdrop={eliminando ? "static" : true}
      >
        <Modal.Header closeButton={!eliminando}>
          <Modal.Title className="h5">Eliminar publicación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-2">
            ¿Eliminar <strong>"{postAEliminar?.titulo}"</strong>?
          </p>
          <p className="mb-0 text-muted">
            Esto también borrará sus comentarios, reacciones e imágenes. Esta
            acción no se puede deshacer.
          </p>
          {errorEliminar && (
            <Alert variant="danger" className="mb-0 mt-3">
              {errorEliminar}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={cerrarModal}
            disabled={eliminando}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={confirmarEliminacion}
            disabled={eliminando}
          >
            {eliminando ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  className="me-2"
                />
                Eliminando...
              </>
            ) : (
              "Eliminar"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}