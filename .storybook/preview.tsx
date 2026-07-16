import type { Preview } from "@storybook/react";
import { withThemeByClassName } from "@storybook/addon-themes";
import { MemoryRouter } from "react-router-dom";
import "../src/index.css";

const preview: Preview = {
  parameters: {
    layout: "padded",
    controls: { expanded: true },
  },
  decorators: [
    /**
     * Theme switcher: adds a toolbar toggle in Storybook that applies
     * either the `.dark` Tailwind class (dark mode, default) or no class
     * (light mode) to the story root element.
     *
     * Both modes are driven by the CSS custom properties in src/index.css:
     *   :root          → light tokens
     *   :root.dark      → dark tokens
     */
    withThemeByClassName({
      themes: {
        light: "",
        dark: "dark",
      },
      defaultTheme: "dark",
    }),
    /**
     * Router + background wrapper. Background colour is inherited from the
     * theme tokens so it responds correctly to the theme toggle above.
     */
    (Story) => (
      <MemoryRouter>
        <div className="min-h-[200px] rounded-lg bg-stellar-dark p-4 text-stellar-text-primary dark:bg-stellar-dark">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
};

export default preview;
