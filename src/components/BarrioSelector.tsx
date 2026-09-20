// src/components/BarrioSelector.tsx
import { BARRIOS, type BarrioSlug } from "../config/barrios";

interface Props {
  barrio: BarrioSlug;
  onCambiar: (barrio: BarrioSlug) => void;
}

export default function BarrioSelector({ barrio, onCambiar }: Props) {
  return (
    <label className="flex items-center gap-2 text-sm text-[var(--ink-muted)]">
      <span className="hidden sm:inline">Barrio:</span>
      <select
        value={barrio}
        onChange={(e) => onCambiar(e.target.value as BarrioSlug)}
        className="border border-[var(--line)] bg-[var(--bg)] px-3 py-1.5 text-sm font-medium text-[var(--ink)] outline-none transition focus:border-[var(--accent)]"
      >
        {BARRIOS.map((b) => (
          <option key={b.slug} value={b.slug}>
            {b.nombre}
          </option>
        ))}
      </select>
    </label>
  );
}
