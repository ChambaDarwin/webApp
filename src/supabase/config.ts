// src/supabase/config.ts
// Requiere estas variables en tu archivo .env en la raíz del proyecto
// (prefijo VITE_ obligatorio en Vite):
//   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
//   VITE_SUPABASE_ANON_KEY=tu-anon-key
//   VITE_SUPABASE_BUCKET=posts   (opcional, por defecto "posts")
//
// En Supabase: crea un bucket público con ese nombre (Storage > New bucket > Public bucket).

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Faltan las variables VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY en tu .env",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const BUCKET_POSTS =
  (import.meta.env.VITE_SUPABASE_BUCKET as string) || "posts";

/**
 * Sube un archivo al bucket de posts y devuelve su URL pública.
 */
export async function subirImagenPost(archivo: File): Promise<string> {
  const nombreArchivo = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}-${archivo.name}`;

  const { error } = await supabase.storage
    .from(BUCKET_POSTS)
    .upload(nombreArchivo, archivo, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`Error subiendo imagen a Supabase: ${error.message}`);
  }

  const { data } = supabase.storage
    .from(BUCKET_POSTS)
    .getPublicUrl(nombreArchivo);

  return data.publicUrl;
}

/**
 * Elimina del bucket de posts las imágenes indicadas (por su URL pública).
 * Ignora las URLs que no pertenezcan a ese bucket.
 * Devuelve cuántas imágenes se borraron realmente.
 *
 * Ojo: Supabase solo borra si el bucket tiene una política de DELETE para el
 * rol usado por el navegador. Si no la tiene, no da error: simplemente no borra
 * nada (por eso se avisa en consola cuando se borran menos de las pedidas).
 */
export async function eliminarImagenesPost(urls: string[]): Promise<number> {
  const marcador = `/object/public/${BUCKET_POSTS}/`;
  const nombres = urls
    .map((url) => {
      const i = url.indexOf(marcador);
      if (i === -1) return null;
      return decodeURIComponent(url.slice(i + marcador.length).split("?")[0]);
    })
    .filter((n): n is string => !!n);

  if (nombres.length === 0) return 0;

  const { data, error } = await supabase.storage
    .from(BUCKET_POSTS)
    .remove(nombres);

  if (error) {
    throw new Error(`Error borrando imágenes en Supabase: ${error.message}`);
  }

  const borradas = data?.length ?? 0;
  if (borradas < nombres.length) {
    console.warn(
      `[eliminarImagenesPost] se pidieron ${nombres.length} y se borraron ${borradas}. ` +
        "Revisa la política de DELETE del bucket en Supabase.",
    );
  }
  return borradas;
}