import React from "react";
import { useShortcutContext } from "../../contexts/ShortcutContext";

export const ShortcutHelp: React.FC = () => {
  const { isHelpOpen, setHelpOpen, shortcuts, customBindings } =
    useShortcutContext();

  if (!isHelpOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-lg w-full p-6 text-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center">
            <span className="mr-2">⌨️</span> Keyboard Shortcuts
          </h2>
          <button
            onClick={() => setHelpOpen(false)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
          {["Navigation", "Actions", "Global"].map((category) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                {category}
              </h3>
              <div className="space-y-2">
                {shortcuts
                  .filter((s) => s.category === category)
                  .map((shortcut) => (
                    <div
                      key={shortcut.id}
                      className="flex justify-between items-center group"
                    >
                      <span className="text-slate-300 group-hover:text-white transition-colors">
                        {shortcut.description}
                      </span>
                      <div className="flex gap-1">
                        {(customBindings[shortcut.id] || shortcut.keys)
                          .split(" ")
                          .map((key, i) => (
                            <React.Fragment key={i}>
                              <kbd className="px-2 py-1 bg-slate-800 border border-slate-600 rounded text-xs font-mono shadow-inner min-w-[1.5rem] text-center">
                                {key === " " ? "Space" : key}
                              </kbd>
                              {i <
                                (
                                  customBindings[shortcut.id] || shortcut.keys
                                ).split(" ").length -
                                  1 && (
                                <span className="text-slate-600 self-center">
                                  +
                                </span>
                              )}
                            </React.Fragment>
                          ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-4 border-t border-slate-800 text-center text-slate-500 text-sm">
          Press{" "}
          <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700">
            ?
          </kbd>{" "}
          to close this menu
        </div>
      </div>
    </div>
  );
};
