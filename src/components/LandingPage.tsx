// src/components/LandingPage.tsx
import AuthButton from "./AuthButton";
import type { UsuarioApp } from "../types";

interface Props {
  usuario: UsuarioApp | null;
}

export default function LandingPage({ usuario }: Props) {
  return (
    <div className="escalon-hero relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-20 text-center">
      <style>{`
        .escalon-hero {
          background: #fbfcfc;
        }

        /* ---------- Aurora de fondo: manchas difuminadas en movimiento ---------- */
        .escalon-hero .aurora {
          position: absolute;
          inset: -10%;
          z-index: 0;
          filter: blur(70px);
          opacity: 0.5;
        }
        .escalon-hero .aurora span {
          position: absolute;
          border-radius: 9999px;
        }
        .escalon-hero .mancha-1 {
          width: 40vw;
          height: 40vw;
          top: -8%;
          left: -6%;
          background: radial-gradient(circle, #0e7490 0%, transparent 70%);
          animation: flotar-1 22s ease-in-out infinite;
        }
        .escalon-hero .mancha-2 {
          width: 34vw;
          height: 34vw;
          bottom: -6%;
          right: -8%;
          background: radial-gradient(circle, #047857 0%, transparent 70%);
          animation: flotar-2 26s ease-in-out infinite;
        }
        .escalon-hero .mancha-3 {
          width: 24vw;
          height: 24vw;
          top: 28%;
          right: 18%;
          background: radial-gradient(circle, #155e75 0%, transparent 70%);
          animation: flotar-3 18s ease-in-out infinite;
        }

        @keyframes flotar-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(4%, 6%) scale(1.08); }
        }
        @keyframes flotar-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-5%, -4%) scale(1.1); }
        }
        @keyframes flotar-3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-3%, 5%) scale(0.92); }
        }

        /* ---------- Grano/textura fina ---------- */
        .escalon-hero .textura {
          position: absolute;
          inset: 0;
          z-index: 1;
          opacity: 0.4;
          background-image: radial-gradient(#0f172a0d 1px, transparent 1px);
          background-size: 26px 26px;
          mask-image: radial-gradient(ellipse 65% 55% at 50% 30%, black 10%, transparent 75%);
        }

        /* ---------- Partículas flotantes (dan sensación de vida) ---------- */
        .escalon-hero .particula {
          position: absolute;
          z-index: 1;
          border-radius: 9999px;
          background: #0e749055;
          animation: subir linear infinite;
        }
        @keyframes subir {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          10% { opacity: 0.7; }
          90% { opacity: 0.5; }
          100% { transform: translateY(-90vh) scale(0.6); opacity: 0; }
        }

        /* ---------- Olas animadas en la base ---------- */
        .escalon-hero .olas-wrap {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          line-height: 0;
          z-index: 2;
        }
        .escalon-hero .olas-wrap svg {
          position: relative;
          display: block;
          width: 200%;
          height: 130px;
        }
        .escalon-hero .ola-1 { animation: desplazar-ola 18s linear infinite; opacity: 0.35; }
        .escalon-hero .ola-2 { animation: desplazar-ola 26s linear infinite reverse; opacity: 0.55; margin-top: -110px; }
        .escalon-hero .ola-3 { animation: desplazar-ola 34s linear infinite; opacity: 0.9; margin-top: -100px; }

        @keyframes desplazar-ola {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        @media (prefers-reduced-motion: reduce) {
          .escalon-hero .ola-1, .escalon-hero .ola-2, .escalon-hero .ola-3,
          .escalon-hero .particula { animation: none; }
        }

        /* ---------- Tipografía ---------- */
        .escalon-hero .etiqueta {
          font-family: "Poppins", ui-sans-serif, system-ui, sans-serif;
          font-size: 0.78rem;
          letter-spacing: 0.04em;
        }
        .escalon-hero h1 {
          font-family: "Poppins", ui-sans-serif, system-ui, sans-serif;
          font-weight: 600;
          letter-spacing: -0.015em;
          line-height: 1.08;
        }
        .escalon-hero p.subtitulo {
          font-family: "Poppins", ui-sans-serif, system-ui, sans-serif;
        }

        /* ---------- Entrada escalonada ---------- */
        @keyframes entrada {
          from { opacity: 0; transform: translateY(16px); filter: blur(2px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        .escalon-hero .anim-1 { opacity: 0; animation: entrada 0.8s cubic-bezier(0.16,1,0.3,1) 0.05s forwards; }
        .escalon-hero .anim-2 { opacity: 0; animation: entrada 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s forwards; }
        .escalon-hero .anim-3 { opacity: 0; animation: entrada 0.8s cubic-bezier(0.16,1,0.3,1) 0.35s forwards; }
        .escalon-hero .anim-4 { opacity: 0; animation: entrada 0.8s cubic-bezier(0.16,1,0.3,1) 0.5s forwards; }

        @keyframes pulso-punto {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.8); }
        }
        .escalon-hero .punto-vivo { animation: pulso-punto 2.2s ease-in-out infinite; }

        /* ---------- Botón principal con brillo sutil al hover ---------- */
        .escalon-hero .boton-wrap :is(button) {
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #0f766e, #0e7490 55%, #075985);
          color: #ffffff;
          font-family: "Poppins", ui-sans-serif, sans-serif;
          font-weight: 600;
          border: none;
          border-radius: 10px;
          box-shadow: 0 8px 24px -8px rgba(14, 116, 144, 0.5);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .escalon-hero .boton-wrap :is(button):hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 30px -10px rgba(14, 116, 144, 0.6);
        }
        .escalon-hero .boton-wrap :is(button)::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.25) 50%, transparent 70%);
          transform: translateX(-100%);
          transition: transform 0.6s ease;
        }
        .escalon-hero .boton-wrap :is(button):hover::after {
          transform: translateX(100%);
        }

        @media (prefers-reduced-motion: reduce) {
          .escalon-hero .anim-1,
          .escalon-hero .anim-2,
          .escalon-hero .anim-3,
          .escalon-hero .anim-4 { animation: none; opacity: 1; }
          .escalon-hero .mancha-1,
          .escalon-hero .mancha-2,
          .escalon-hero .mancha-3,
          .escalon-hero .punto-vivo { animation: none; }
        }
      `}</style>

      {/* Fondo aurora + textura */}
      <div className="aurora">
        <span className="mancha-1" />
        <span className="mancha-2" />
        <span className="mancha-3" />
      </div>
      <div className="textura" />

      {/* Partículas flotantes */}
      {[
        { left: "8%", size: 6, dur: "14s", delay: "0s" },
        { left: "20%", size: 4, dur: "18s", delay: "3s" },
        { left: "34%", size: 8, dur: "16s", delay: "1s" },
        { left: "52%", size: 5, dur: "20s", delay: "5s" },
        { left: "68%", size: 7, dur: "15s", delay: "2s" },
        { left: "80%", size: 4, dur: "19s", delay: "6s" },
        { left: "92%", size: 6, dur: "17s", delay: "4s" },
      ].map((p, i) => (
        <span
          key={i}
          className="particula"
          style={{
            left: p.left,
            bottom: "-20px",
            width: p.size,
            height: p.size,
            animationDuration: p.dur,
            animationDelay: p.delay,
          }}
        />
      ))}

      <div className="relative z-10 mx-auto max-w-xl">
        {/* Etiqueta superior */}
        <div className="etiqueta anim-1 mb-7 inline-flex items-center gap-2 rounded-full border border-teal-100 bg-white/80 px-4 py-1.5 font-medium text-teal-900 shadow-sm backdrop-blur">
          <span className="relative flex h-2 w-2">
            <span className="punto-vivo absolute inline-flex h-full w-full rounded-full bg-teal-500" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-600" />
          </span>
          <i className="bi bi-shield-fill-check text-teal-700" />
          <strong className="font-semibold text-slate-900">Proyecto Escalón 1</strong>
        </div>

        {/* Título */}
        <h1 className="anim-2 text-4xl text-slate-900 sm:text-6xl">
          Su precaución salva vidas
        </h1>

        {/* Subtítulo */}
        <p className="subtitulo anim-3 mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
          Creamos este espacio para mantener a la comunidad informada en
          tiempo real sobre los tramos con huecos, zanjas y zonas de riesgo
          mientras dura el proyecto. Nuestro compromiso es reducir los
          accidentes viales y peatonales mediante información clara,
          actualizada y accesible para todos.
        </p>

        {/* CTA */}
        <div className="boton-wrap anim-4 mt-10 flex justify-center [&>button]:px-9 [&>button]:py-3.5 [&>button]:text-[15px]">
          <AuthButton usuario={usuario} variante="hero" />
        </div>
      </div>

      {/* Olas animadas en la base */}
      <div className="olas-wrap">
        <svg className="ola-1" viewBox="0 0 2800 200" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path
            fill="#0e7490"
            d="M0,100 C 200,180 400,20 700,100 C 1000,180 1200,20 1400,100 C 1600,180 1800,20 2100,100 C 2300,180 2500,20 2800,100 L2800,200 L0,200 Z"
          />
        </svg>
        <svg className="ola-2" viewBox="0 0 2800 200" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path
            fill="#0f766e"
            d="M0,110 C 250,30 450,190 750,110 C 1050,30 1250,190 1550,110 C 1850,30 2050,190 2350,110 C 2550,30 2650,190 2800,110 L2800,200 L0,200 Z"
          />
        </svg>
        <svg className="ola-3" viewBox="0 0 2800 200" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path
            fill="#0c4a6e"
            d="M0,120 C 220,60 480,170 760,120 C 1040,60 1300,170 1580,120 C 1860,60 2120,170 2400,120 C 2560,90 2680,150 2800,120 L2800,200 L0,200 Z"
          />
        </svg>
      </div>
    </div>
  );
}