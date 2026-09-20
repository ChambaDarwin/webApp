// src/config/barrios.ts
//
// Fuente única de verdad para los barrios que tiene la app.
// Para agregar un nuevo barrio en el futuro:
//   1. Agrega una entrada aquí (slug + nombre visible).
//   2. Crea su archivo de contenido (copia components/LaCocha.tsx) y
//      regístralo en src/config/contenidoBarrios.tsx
//   3. En Firestore, crea/edita el documento del usuario que será admin
//      y ponle `rol: "<slug>"` (exactamente el slug que definas aquí).
// No hace falta tocar ningún otro archivo.

export const BARRIOS = [
  { slug: "sanMartin", nombre: "San Martín" },
  { slug: "laCocha", nombre: "La Cocha" },
] as const;

export type BarrioSlug = (typeof BARRIOS)[number]["slug"];

export function nombreBarrio(slug: BarrioSlug | string): string {
  return BARRIOS.find((b) => b.slug === slug)?.nombre ?? slug;
}

export function esBarrioValido(valor: string): valor is BarrioSlug {
  return BARRIOS.some((b) => b.slug === valor);
}

// Barrio que se muestra la primera vez que alguien entra a la app.
export const BARRIO_POR_DEFECTO: BarrioSlug = "sanMartin";
