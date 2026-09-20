// src/hooks/useAuth.ts
import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import type { RolUsuario, UsuarioApp } from "../types";
import { esBarrioValido } from "../config/barrios";

interface EstadoAuth {
  usuario: UsuarioApp | null;
  cargando: boolean;
}

/**
 * Busca el documento del usuario en la colección "usuarios".
 * Si no existe (primer inicio de sesión), lo crea con rol "publico" por defecto.
 *
 * El rol de admin se asigna manualmente en Firestore poniendo el campo `rol`
 * al slug exacto de un barrio (ej. "sanMartin" o "laCocha"), definido en
 * src/config/barrios.ts. Ese admin solo podrá publicar en ese barrio.
 */
async function obtenerORegistrarUsuario(
  firebaseUser: User
): Promise<RolUsuario> {
  const refUsuario = doc(db, "usuarios", firebaseUser.uid);
  const snap = await getDoc(refUsuario);

  if (snap.exists()) {
    const datos = snap.data();
    const rol = datos.rol as string | undefined;
    if (rol && (rol === "publico" || esBarrioValido(rol))) {
      return rol as RolUsuario;
    }
    return "publico";
  }

  await setDoc(refUsuario, {
    nombre: firebaseUser.displayName ?? "Ciudadano",
    correo: firebaseUser.email ?? null,
    foto: firebaseUser.photoURL ?? null,
    rol: "publico" as RolUsuario,
    creadoEn: serverTimestamp(),
  });

  return "publico";
}

function construirUsuario(firebaseUser: User, rol: RolUsuario): UsuarioApp {
  const esAdmin = rol !== "publico";
  return {
    uid: firebaseUser.uid,
    nombre: firebaseUser.displayName ?? "Ciudadano",
    foto: firebaseUser.photoURL ?? undefined,
    rol,
    esAdmin,
    barrioAdmin: esAdmin ? rol : undefined,
  };
}

export function useAuth(): EstadoAuth {
  const [usuario, setUsuario] = useState<UsuarioApp | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        try {
          const rol = await obtenerORegistrarUsuario(firebaseUser);
          setUsuario(construirUsuario(firebaseUser, rol));
        } catch (error) {
          console.error("Error registrando usuario en Firestore:", error);
          setUsuario(construirUsuario(firebaseUser, "publico"));
        }
      } else {
        setUsuario(null);
      }
      setCargando(false);
    });

    return () => unsubscribe();
  }, []);

  return { usuario, cargando };
}
