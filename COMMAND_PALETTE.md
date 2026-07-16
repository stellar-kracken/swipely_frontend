# Command Palette

The command palette component lives at `src/components/CommandPalette.tsx` and exposes a small API to register actions:

- `registerAction({ id, title, href?, keywords?, onExecute? })`

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `Cmd+K` / `Ctrl+K` | Open / close the palette |
| `↑` / `↓` | Move between results |
| `Enter` | Execute the highlighted action |
| `Escape` | Close the palette |
| `Tab` / `Shift+Tab` | Cycle focus within the palette (focus trapped while open) |

On mobile, a visible **Search** button in the Navbar opens the palette.

## Accessibility

- Dialog uses `role="dialog"`, `aria-modal="true"`, and `aria-label="Command palette"`.
- Input uses `role="combobox"`, `aria-autocomplete="list"`, `aria-controls`, and `aria-activedescendant` to wire keyboard navigation to the listbox.
- Results list uses `role="listbox"`; each item uses `role="option"` with `aria-selected`.
- A `role="status"` live region announces the result count on every query change so screen-reader users know how many options are available.
- Focus is **trapped** inside the dialog while open and **restored** to the previously focused element on close.
- Respects `prefers-reduced-motion`: all transition durations are suppressed when the user has requested reduced motion.

## Recent actions

Recent actions are persisted to `localStorage` under the key `swipely:recent_actions`. Up to 10 recent actions are stored. They are shown in place of search results when the query is empty.

## Registering actions

Import `registerAction` from `../utils/commandRegistry` and call it during app initialisation or component mount. Example:

```ts
import { registerAction } from "../utils/commandRegistry";

registerAction({
  id: "goto-dashboard",
  title: "Go to Dashboard",
  href: "/dashboard",
  keywords: ["home", "start"],
});
```
