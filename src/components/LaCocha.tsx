// src/components/LaCocha.tsx
//
// Contenido del barrio La Cocha: el bloque "Estado del proyecto" que se ve
// arriba de las publicaciones y la información adicional (imágenes + textos)
// que se ve debajo. Para cambiar textos o fotos de La Cocha, edita solo este archivo.
import type { ContenidoBarrio } from "../config/contenidoBarrios";

// Las imágenes de La Cocha son de ejemplo (placehold.co):
// reemplázalas por las fotos reales del puente y del área restringida.
export const contenidoLaCocha: ContenidoBarrio = {
  estado: {
    titulo: "Puente de uso exclusivo para peatones",
    descripcion:
      "El puente es de uso exclusivo de peatones y no se permite el ingreso de motocicletas. Además, te pedimos circular fuera del área restringida: dentro de ella hay excavaciones con huecos profundos que pueden ocasionar accidentes.",
  },
  bloques: [
    {
      icono: "⚠️",
      titulo: "¡Precaución, área restringida!",
      imagenes: [
        "https://aidqorkayvxqgfesgoud.supabase.co/storage/v1/object/public/seguridad/img1_c.jpeg",
        "https://aidqorkayvxqgfesgoud.supabase.co/storage/v1/object/public/seguridad/img2_c.jpeg",
        "https://aidqorkayvxqgfesgoud.supabase.co/storage/v1/object/public/seguridad/img3_c.jpeg",
      ],
      contenido: (
        <>
          <p className="mb-4">
            Para tu seguridad, circula siempre fuera del área restringida.
            Dentro de ella existen excavaciones con huecos profundos que
            pueden ocasionar accidentes.
          </p>
          <ul className="mb-4 list-none space-y-2 pl-0">
            <li>
              🚧 Respeta la señalización y las cintas de seguridad: no las
              retires ni las cruces.
            </li>
            <li>🕳️ No te acerques a los huecos ni a las excavaciones.</li>
            <li>
              🚶‍♀️ Transita únicamente por las zonas habilitadas para
              peatones.
            </li>
          </ul>
          <p className="mb-0">
            Una distracción o un descuido puede ocasionar un accidente.
            Respetar la señalización protege tu vida y la de quienes te
            rodean.
          </p>
        </>
      ),
    },
    {
      icono: "🚫",
      titulo: "Prohibido el ingreso de motocicletas",
      imagenes: [
        "https://aidqorkayvxqgfesgoud.supabase.co/storage/v1/object/public/seguridad/img4_c.jpeg",
        "https://aidqorkayvxqgfesgoud.supabase.co/storage/v1/object/public/seguridad/img5_c.jpeg",
        "https://aidqorkayvxqgfesgoud.supabase.co/storage/v1/object/public/seguridad/img6_c.jpeg"
      ],
      contenido: (
        <>
          <p className="mb-4">
            El puente es de uso exclusivo de peatones y no se permite el
            ingreso de motocicletas.
          </p>
          <p className="mb-4">
            Quienes circulen por el sector deben hacerlo fuera del área
            restringida, ya que dentro hay excavaciones con huecos profundos
            que pueden ocasionar accidentes.
          </p>
          <ul className="mb-4 list-none space-y-2 pl-0">
            <li>🚶 El puente es solo para peatones.</li>
            <li>🚧 Respetar la señalización es prevenir accidentes.</li>
          </ul>
          <p className="mb-0 font-semibold text-[var(--ink)]">
            ¡Moradores de La Cocha, cuidemos nuestra vida y la de nuestras
            familias!
          </p>
        </>
      ),
    },
  ],
};
