// src/components/InfoSanMartin.tsx
//
// Contenido del barrio San Martín: el bloque "Estado del proyecto" que se ve
// arriba de las publicaciones y la información adicional (imágenes + textos)
// que se ve debajo. Para cambiar textos o fotos de San Martín, edita solo este archivo.
import type { ContenidoBarrio } from "../config/contenidoBarrios";

export const contenidoSanMartin: ContenidoBarrio = {
  estado: {
    titulo: "Trabajando por una vía segura",
    descripcion:
      "Actualmente se realizan obras de alcantarillado en el sector. Una vez concluidas, se procederá con la repavimentación de la vía. Mientras tanto, existen huecos abiertos: te pedimos precaución al circular por la zona y respetar la señalización y las mallas naranjas de seguridad.",
  },
  bloques: [
    {
      icono: "⚠️",
      titulo: "¡Precaución, zona de peligro!",
      imagenes: [
        "https://aidqorkayvxqgfesgoud.supabase.co/storage/v1/object/public/seguridad/img1_sm.jpeg",
        "https://aidqorkayvxqgfesgoud.supabase.co/storage/v1/object/public/seguridad/img2_sm.jpeg",
        "https://aidqorkayvxqgfesgoud.supabase.co/storage/v1/object/public/seguridad/img3_sm.jpeg",
        "https://aidqorkayvxqgfesgoud.supabase.co/storage/v1/object/public/seguridad/img4_sm.jpeg",
      ],
      contenido: (
        <>
          <p className="mb-4">
            Si encuentras esta señalización, no te acerques, no ingreses al
            área restringida y respeta las cintas y mallas de seguridad. En
            el sector existen pozos, excavaciones y zonas en intervención
            que pueden representar un riesgo de caídas y accidentes.
          </p>
          <ul className="mb-4 list-none space-y-2 pl-0">
            <li>
              🚧 Por tu seguridad, no retires, cruces ni muevas la
              señalización de prevención.
            </li>
            <li>
              👷‍♂️ Mantente alejado de las áreas donde se realizan trabajos y
              permite que el personal pueda desarrollar sus actividades de
              manera segura.
            </li>
            <li>
              🚶‍♀️ Si eres morador del sector, utiliza únicamente los pasos y
              accesos habilitados y evita transitar dentro de las zonas de
              trabajo.
            </li>
          </ul>
          <p className="mb-0">
            Recuerda que una distracción o un descuido puede ocasionar un
            accidente. Respetar la señalización es una acción sencilla que
            puede proteger tu vida y la de quienes te rodean.
          </p>
        </>
      ),
    },
    {
      icono: "🚫",
      titulo: "Prohibido el ingreso de vehículos",
      imagenes: [
        "https://aidqorkayvxqgfesgoud.supabase.co/storage/v1/object/public/seguridad/img3_v.jpeg",
        "https://aidqorkayvxqgfesgoud.supabase.co/storage/v1/object/public/seguridad/img2_v.jpeg",
        "https://aidqorkayvxqgfesgoud.supabase.co/storage/v1/object/public/seguridad/img1_v.jpeg",
      ],
      contenido: (
        <>
          <p className="mb-4">
            Debido a los trabajos que se ejecutan en la vía, se prohíbe el
            ingreso y circulación de vehículos en el área intervenida, ya
            que se encuentra operando volquetas y maquinaria pesada, lo que
            podría ocasionar accidentes.
          </p>
          <p className="mb-4">
            De igual manera, solicitamos a todos los moradores transitar
            únicamente por las áreas habilitadas y dentro de las mallas de
            seguridad, evitando acercarse a excavaciones, maquinaria o zonas
            restringidas.
          </p>
          <ul className="mb-4 list-none space-y-2 pl-0">
            <li>🚧 Respetar la señalización es prevenir accidentes.</li>
            <li>🦺 La mejor manera de prevenir es protegernos entre todos.</li>
          </ul>
          <p className="mb-0 font-semibold text-[var(--ink)]">
            ¡Moradores de San Martín, cuidemos nuestra vida y la de nuestras
            familias!
          </p>
        </>
      ),
    },
  ],
};
