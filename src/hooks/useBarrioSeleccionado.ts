// src/hooks/useBarrioSeleccionado.ts
//
// El barrio que el visitante está viendo. No es un rol ni requiere login:
// se guarda en localStorage y puede cambiarse en cualquier momento desde la UI.
import { useEffect, useState } from "react";
import {
  BARRIO_POR_DEFECTO,
  esBarrioValido,
  type BarrioSlug,
} from "../config/barrios";
import type { UsuarioApp } from "../types";

const CLAVE_BARRIO = "escalon1_barrio_seleccionado";

function leerBarrioGuardado(): BarrioSlug | null {
  const guardado = localStorage.getItem(CLAVE_BARRIO);
  if (guardado && esBarrioValido(guardado)) return guardado;
  return null;
}

export function useBarrioSeleccionado(usuario: UsuarioApp | null) {
  const [barrio, setBarrioState] = useState<BarrioSlug>(
    () => leerBarrioGuardado() ?? BARRIO_POR_DEFECTO
  );

  // Si el usuario es admin de un barrio y todavía no eligió ninguno
  // explícitamente, lo llevamos por defecto a ver su propio barrio.
  useEffect(() => {
    if (usuario?.barrioAdmin && !leerBarrioGuardado()) {
      setBarrioState(usuario.barrioAdmin);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario?.barrioAdmin]);

  const setBarrio = (nuevo: BarrioSlug) => {
    localStorage.setItem(CLAVE_BARRIO, nuevo);
    setBarrioState(nuevo);
  };

  return { barrio, setBarrio };
}
