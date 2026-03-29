import { useEffect } from "react";
import { ShortcutAction, useShortcutContext } from "../../contexts/ShortcutContext";

/**
 * Registers local, context-aware keyboard shortcuts for a component.
 * Automatically unregisters when the component unmounts.
 *
 * @param id - The ID of the shortcut definition (must exist in DEFAULT_SHORTCUTS)
 * @param action - The function to execute when triggered
 */
export const useKeyboardShortcut = (id: string, action: ShortcutAction) => {
  const { registerShortcut, unregisterShortcut } = useShortcutContext();

  useEffect(() => {
    registerShortcut(id, action);
    return () => unregisterShortcut(id);
  }, [id, action, registerShortcut, unregisterShortcut]);

  const { customBindings, shortcuts } = useShortcutContext();
  const definition = shortcuts.find((s) => s.id === id);
  const keys = customBindings[id] || definition?.keys || "";

  return { keys };
};
