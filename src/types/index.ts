// src/types/index.ts
import type { BarrioSlug } from "../config/barrios";

// El rol de un usuario es "publico" o el slug de un barrio (= admin de ese barrio).
export type RolUsuario = "publico" | BarrioSlug;

export interface Post {
  id: string;
  barrio: BarrioSlug; // a qué barrio pertenece esta publicación
  titulo: string;
  descripcion: string;
  imagenes: string[]; // URLs públicas de Supabase Storage
  autorId: string;
  autorNombre: string;
  creadoEn: number; // timestamp (Date.now())
  editadoEn?: number | null;
  duracionDias: number; // cuántos días permanece visible el post
  expiraEn: number; // timestamp: creadoEn + duracionDias en ms
}

export interface Comentario {
  id: string;
  postId: string;
  texto: string;
  autorId: string;
  autorNombre: string;
  autorFoto?: string;
  creadoEn: number;
  editadoEn?: number | null;
  respuestaA?: string | null; // id del comentario padre, si es una respuesta
  eliminado?: boolean; // el autor lo eliminó pero tiene respuestas de otras personas
}

export interface UsuarioApp {
  uid: string;
  nombre: string;
  foto?: string;
  rol: RolUsuario;
  esAdmin: boolean; // derivado de rol !== "publico", por comodidad
  barrioAdmin?: BarrioSlug; // si esAdmin, el barrio que administra
}
