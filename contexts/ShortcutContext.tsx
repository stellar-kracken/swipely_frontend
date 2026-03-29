import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

export type ShortcutAction = () => void;

export interface ShortcutDefinition {
  id: string;
  keys: string; // e.g., 'g h', '/', '?'
  description: string;
  category: "Navigation" | "Actions" | "Global";
  isGlobal: boolean;
}

interface ShortcutContextType {
  registerShortcut: (id: string, action: ShortcutAction) => void;
  unregisterShortcut: (id: string) => void;
  shortcuts: ShortcutDefinition[];
  customBindings: Record<string, string>;
  updateBinding: (id: string, newKeys: string) => void;
  resetToDefaults: () => void;
  isHelpOpen: boolean;
  setHelpOpen: (open: boolean) => void;
}

const DEFAULT_SHORTCUTS: ShortcutDefinition[] = [
  {
    id: "nav-home",
    keys: "g h",
    description: "Go to Home",
    category: "Navigation",
    isGlobal: true,
  },
  {
    id: "nav-bridges",
    keys: "g b",
    description: "Go to Bridges",
    category: "Navigation",
    isGlobal: true,
  },
  {
    id: "nav-assets",
    keys: "g a",
    description: "Go to Assets",
    category: "Navigation",
    isGlobal: true,
  },
  {
    id: "action-search",
    keys: "/",
    description: "Focus Search",
    category: "Actions",
    isGlobal: true,
  },
  {
    id: "action-refresh",
    keys: "r",
    description: "Refresh Data",
    category: "Actions",
    isGlobal: true,
  },
  {
    id: "action-theme",
    keys: "t",
    description: "Toggle Theme",
    category: "Actions",
    isGlobal: true,
  },
  {
    id: "global-help",
    keys: "?",
    description: "Show Help",
    category: "Global",
    isGlobal: true,
  },
];

const BINDINGS_KEY = "sbw_shortcut_bindings";

const ShortcutContext = createContext<ShortcutContextType | undefined>(
  undefined
);

export const ShortcutProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isHelpOpen, setHelpOpen] = useState(false);
  const [customBindings, setCustomBindings] = useState<Record<string, string>>(
    () => {
      if (typeof window === "undefined") return {};
      const saved = localStorage.getItem(BINDINGS_KEY);
      return saved ? JSON.parse(saved) : {};
    }
  );

  // Map of ID to the actual function to execute
  const actionRegistry = useRef<Record<string, ShortcutAction>>({});
  // Buffer for sequence detection (e.g., 'g' then 'h')
  const keyBuffer = useRef<string[]>([]);
  const bufferTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const registerShortcut = useCallback((id: string, action: ShortcutAction) => {
    actionRegistry.current[id] = action;
  }, []);

  const unregisterShortcut = useCallback((id: string) => {
    delete actionRegistry.current[id];
  }, []);

  const updateBinding = (id: string, newKeys: string) => {
    const updated = { ...customBindings, [id]: newKeys };
    setCustomBindings(updated);
    localStorage.setItem(BINDINGS_KEY, JSON.stringify(updated));
  };

  const resetToDefaults = () => {
    setCustomBindings({});
    localStorage.removeItem(BINDINGS_KEY);
  };

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      const key = event.key.toLowerCase();

      // Clear previous timeout
      if (bufferTimeout.current) clearTimeout(bufferTimeout.current);

      // Update sequence buffer
      keyBuffer.current.push(key);
      const currentSequence = keyBuffer.current.join(" ");

      // Find if this matches any shortcut
      const matchedShortcut = DEFAULT_SHORTCUTS.find((s) => {
        const binding = customBindings[s.id] || s.keys;
        return binding === currentSequence;
      });

      if (matchedShortcut) {
        const action = actionRegistry.current[matchedShortcut.id];
        if (action) {
          event.preventDefault();
          action();
          keyBuffer.current = []; // Clear buffer after success
        }
      }

      // Check for partial matches to continue sequence
      const isPartialMatch = DEFAULT_SHORTCUTS.some((s) => {
        const binding = customBindings[s.id] || s.keys;
        return binding.startsWith(currentSequence);
      });

      if (!isPartialMatch) {
        keyBuffer.current = [];
      } else {
        // Auto-clear buffer after 500ms of inactivity
        bufferTimeout.current = setTimeout(() => {
          keyBuffer.current = [];
        }, 500);
      }
    },
    [customBindings]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  // Initialize default global actions
  useEffect(() => {
    registerShortcut("global-help", () => setHelpOpen((prev) => !prev));
  }, [registerShortcut]);

  return (
    <ShortcutContext.Provider
      value={{
        registerShortcut,
        unregisterShortcut,
        shortcuts: DEFAULT_SHORTCUTS,
        customBindings,
        updateBinding,
        resetToDefaults,
        isHelpOpen,
        setHelpOpen,
      }}
    >
      {children}
    </ShortcutContext.Provider>
  );
};

export const useShortcutContext = () => {
  const context = useContext(ShortcutContext);
  if (!context) {
    throw new Error(
      "useShortcutContext must be used within a ShortcutProvider"
    );
  }
  return context;
};
