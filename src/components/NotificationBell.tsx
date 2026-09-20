// src/components/NotificationBell.tsx
import { useState } from "react";
import type { Post } from "../types";

interface Props {
  nuevos: Post[];
  onAbrir: () => void;
}

export default function NotificationBell({ nuevos, onAbrir }: Props) {
  const [abierto, setAbierto] = useState(false);

  const alternar = () => {
    const siguiente = !abierto;
    setAbierto(siguiente);
    if (siguiente && nuevos.length > 0) {
      onAbrir();
    }
  };

  return (
    <div className="relative">
      <button
        onClick={alternar}
        aria-label="Notificaciones"
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] text-[var(--ink-muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 12 6 8Z" />
          <path d="M10 19a2 2 0 0 0 4 0" />
        </svg>
        {nuevos.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--accent)] px-1 font-[family-name:var(--mono)] text-[10px] font-medium text-white">
            {nuevos.length}
          </span>
        )}
      </button>

      {abierto && (
        <div className="absolute right-0 z-20 mt-2 w-72 border border-[var(--line)] bg-[var(--bg)] shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
          <div className="border-b border-[var(--line)] px-4 py-3">
            <p className="text-sm font-medium text-[var(--ink)]">
              Publicaciones recientes
            </p>
          </div>
          {nuevos.length === 0 ? (
            <p className="px-4 py-4 text-sm text-[var(--ink-muted)]">
              No hay publicaciones nuevas por ahora.
            </p>
          ) : (
            <ul className="max-h-72 overflow-y-auto">
              {nuevos.map((post) => (
                <li
                  key={post.id}
                  className="border-b border-[var(--line)] px-4 py-3 last:border-b-0"
                >
                  <p className="text-sm font-medium text-[var(--ink)]">
                    {post.titulo}
                  </p>
                  <p className="mt-0.5 font-[family-name:var(--mono)] text-xs text-[var(--ink-muted)]">
                    {new Date(post.creadoEn).toLocaleDateString("es-EC", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
