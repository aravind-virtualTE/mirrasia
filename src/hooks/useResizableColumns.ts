import { useCallback, useEffect, useRef, useState } from "react";

export interface ColumnDef {
  /** Unique key for this column (used as the map key in localStorage). */
  key: string;
  /** Default width in pixels when no saved width exists. */
  defaultWidth: number;
  /** Minimum width the user can shrink the column to. */
  minWidth?: number;
  /** Maximum width the user can grow the column to. */
  maxWidth?: number;
}

interface UseResizableColumnsOptions {
  /** Unique key to namespace this table's widths in localStorage. */
  storageKey: string;
  /** Column definitions with defaults. */
  columns: ColumnDef[];
}

interface ResizeState {
  /** Currently active column key being resized, or null. */
  activeColumn: string | null;
  /** Starting X position of the drag. */
  startX: number;
  /** Width of the column when the drag started. */
  startWidth: number;
}

const STORAGE_PREFIX = "resizable-cols:";

function loadWidths(storageKey: string): Record<string, number> | null {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null) return parsed;
  } catch {
    /* corrupted data – ignore */
  }
  return null;
}

function saveWidths(storageKey: string, widths: Record<string, number>) {
  try {
    localStorage.setItem(STORAGE_PREFIX + storageKey, JSON.stringify(widths));
  } catch {
    /* storage full – silently ignore */
  }
}

export function useResizableColumns({ storageKey, columns }: UseResizableColumnsOptions) {
  // Build default widths map
  const defaultWidths = useRef<Record<string, number>>({});
  const colMeta = useRef<Record<string, { min: number; max: number }>>({});
  columns.forEach((col) => {
    defaultWidths.current[col.key] = col.defaultWidth;
    colMeta.current[col.key] = {
      min: col.minWidth ?? 60,
      max: col.maxWidth ?? 800,
    };
  });

  const [widths, setWidths] = useState<Record<string, number>>(() => {
    const saved = loadWidths(storageKey);
    // Merge saved widths with defaults (in case columns changed)
    const merged: Record<string, number> = {};
    columns.forEach((col) => {
      merged[col.key] = saved?.[col.key] ?? col.defaultWidth;
    });
    return merged;
  });

  // Persist whenever widths change
  useEffect(() => {
    saveWidths(storageKey, widths);
  }, [storageKey, widths]);

  // Drag state – kept in a ref so mouse-move handler doesn't cause re-renders every pixel
  const resizeState = useRef<ResizeState>({
    activeColumn: null,
    startX: 0,
    startWidth: 0,
  });
  const latestWidths = useRef(widths);
  latestWidths.current = widths;

  // Mouse move handler – throttled via requestAnimationFrame
  const rafId = useRef<number>(0);
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!resizeState.current.activeColumn) return;
    cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      const { activeColumn, startX, startWidth } = resizeState.current;
      if (!activeColumn) return;
      const meta = colMeta.current[activeColumn];
      const delta = e.clientX - startX;
      const newWidth = Math.max(meta.min, Math.min(meta.max, startWidth + delta));
      setWidths((prev) => ({ ...prev, [activeColumn]: newWidth }));
    });
  }, []);

  const handleMouseUp = useCallback(() => {
    resizeState.current.activeColumn = null;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove]);

  const startResize = useCallback(
    (columnKey: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      resizeState.current = {
        activeColumn: columnKey,
        startX: e.clientX,
        startWidth: latestWidths.current[columnKey] ?? defaultWidths.current[columnKey] ?? 120,
      };
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [handleMouseMove, handleMouseUp]
  );

  const resetWidths = useCallback(() => {
    const defaults: Record<string, number> = {};
    columns.forEach((col) => {
      defaults[col.key] = col.defaultWidth;
    });
    setWidths(defaults);
  }, [columns]);

  /** Get the current width for a column key. */
  const getWidth = useCallback(
    (key: string) => widths[key] ?? defaultWidths.current[key] ?? 120,
    [widths]
  );

  return { widths, getWidth, startResize, resetWidths };
}
