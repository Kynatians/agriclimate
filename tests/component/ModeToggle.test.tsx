import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ModeToggle } from "@/components/shared/ModeToggle";
import { setSessionRole } from "@/lib/auth/mock-session";
import { useUiStore } from "@/lib/stores/ui";

describe("ModeToggle Component & Role Gating", () => {
  beforeEach(() => {
    useUiStore.setState({ mode: "farmer" });
  });

  it("renders Farmer and Officer mode buttons", () => {
    render(<ModeToggle />);
    expect(screen.getByRole("button", { name: /farmer/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /officer/i })).toBeDefined();
  });

  it("shows Permission Dialog when unauthorized farmer attempts officer mode", () => {
    setSessionRole("farmer");
    render(<ModeToggle />);

    const officerBtn = screen.getByRole("button", { name: /officer/i });
    fireEvent.click(officerBtn);

    // Permission Dialog should appear with explanatory text
    expect(screen.getByText(/Officer Role Required/i)).toBeDefined();
    expect(useUiStore.getState().mode).toBe("farmer"); // Must not have switched yet
  });

  it("switches to officer mode immediately when authorized as officer", () => {
    setSessionRole("officer");
    render(<ModeToggle />);

    const officerBtn = screen.getByRole("button", { name: /officer/i });
    fireEvent.click(officerBtn);

    expect(useUiStore.getState().mode).toBe("officer");
  });
});
