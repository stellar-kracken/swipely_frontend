import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { NotificationProvider } from "../context/NotificationContext";
import ThemeProvider from "../theme/ThemeProvider";
import Navbar from "./Navbar";

function renderNavbar(path = "/") {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <NotificationProvider>
          <MemoryRouter initialEntries={[path]}>
            <Navbar />
          </MemoryRouter>
        </NotificationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

describe("Navbar", () => {
  it("opens and closes the mobile menu from the hamburger control", () => {
    renderNavbar("/dashboard");

    const openBtn = screen.getByRole("button", { name: "Open menu" });
    fireEvent.click(openBtn);

    expect(screen.getByRole("dialog", { name: "Mobile navigation" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close menu" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Close menu" }));
    expect(screen.queryByRole("dialog", { name: "Mobile navigation" })).not.toBeInTheDocument();
  });

  it("closes the menu when navigating via a mobile link", () => {
    renderNavbar("/dashboard");

    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    const dialog = screen.getByRole("dialog", { name: "Mobile navigation" });
    fireEvent.click(within(dialog).getByRole("link", { name: "Settings" }));

    expect(screen.queryByRole("dialog", { name: "Mobile navigation" })).not.toBeInTheDocument();
  });
});
