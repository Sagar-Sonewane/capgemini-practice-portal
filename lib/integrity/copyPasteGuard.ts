import React from "react";

/**
 * Event handlers and styles to deter copy-paste and text selection
 * on test items (e.g. Reading sentences).
 */
export const copyPasteGuardProps = {
  onCopy: (e: React.ClipboardEvent) => e.preventDefault(),
  onCut: (e: React.ClipboardEvent) => e.preventDefault(),
  onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  onDragStart: (e: React.DragEvent) => e.preventDefault(),
  className: "select-none",
  style: {
    userSelect: "none" as const,
    WebkitUserSelect: "none" as const,
    MozUserSelect: "none" as const,
    msUserSelect: "none" as const,
  },
};

/**
 * Standalone helper function to bind protection handlers to an element or container
 */
export function preventTextCopy(e: React.SyntheticEvent): void {
  e.preventDefault();
}
