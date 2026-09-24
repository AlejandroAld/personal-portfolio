"use client";

import { exit } from "@/lib/explorer";

/** Cerrar la sala: Esc hace lo mismo. Sólo existe en modo explorar (CSS). */
export default function RoomClose({ label }: { label: string }) {
  return (
    <button type="button" className="room-close" onClick={() => exit()} aria-label={label}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
      </svg>
      <span className="room-close-key" aria-hidden="true">
        Esc
      </span>
    </button>
  );
}
