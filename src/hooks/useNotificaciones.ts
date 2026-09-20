// src/hooks/useNotificaciones.ts
//
// Notificaciones dentro de la app (campanita): no son push del navegador,
// sino un contador de publicaciones nuevas desde la última vez que el
// usuario abrió el listado, guardado en localStorage.
import { useEffect, useState } from "react";
import type { Post } from "../types";

const CLAVE_ULTIMA_VISITA = "escalon1_ultima_visita";

function leerUltimaVisita(): number {
  const guardado = localStorage.getItem(CLAVE_ULTIMA_VISITA);
  return guardado ? Number(guardado) : 0;
}

export function useNotificaciones(posts: Post[]) {
  const [ultimaVisita, setUltimaVisita] = useState<number>(leerUltimaVisita);

  const nuevos = posts.filter((p) => p.creadoEn > ultimaVisita);

  const marcarComoVistas = () => {
    const ahora = Date.now();
    localStorage.setItem(CLAVE_ULTIMA_VISITA, String(ahora));
    setUltimaVisita(ahora);
  };

  // Si es la primera visita (sin nada guardado), no bombardear con "todo es nuevo".
  useEffect(() => {
    if (ultimaVisita === 0 && posts.length > 0) {
      marcarComoVistas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts.length]);

  return { nuevos, marcarComoVistas };
}
