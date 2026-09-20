// src/config/contenidoBarrios.tsx
//
// Registro del contenido de cada barrio. El contenido en sí vive en un archivo
// por barrio (components/InfoSanMartin.tsx, components/LaCocha.tsx, ...).
//
// Para agregar un barrio nuevo:
//   1. Regístralo en src/config/barrios.ts (slug + nombre).
//   2. Crea su archivo, copiando components/LaCocha.tsx como plantilla.
//   3. Impórtalo y agrégalo abajo, con el mismo slug del paso 1.
// Si olvidas el paso 3, TypeScript marca error (falta el barrio en el Record).
import type { ReactNode } from "react";
import type { BarrioSlug } from "./barrios";
import { contenidoSanMartin } from "../components/InfoSanMartin";
import { contenidoLaCocha } from "../components/LaCocha";

export interface BloqueInfo {
  icono: string;
  titulo: string;
  imagenes: string[];
  contenido: ReactNode;
}

// Texto principal que se muestra arriba de las publicaciones
// ("Estado del proyecto · <barrio>", título y descripción).
export interface EstadoProyecto {
  titulo: string;
  descripcion: string;
}

export interface ContenidoBarrio {
  estado: EstadoProyecto;
  bloques: BloqueInfo[];
}

export const CONTENIDO_BARRIOS: Record<BarrioSlug, ContenidoBarrio> = {
  sanMartin: contenidoSanMartin,
  laCocha: contenidoLaCocha,
};
