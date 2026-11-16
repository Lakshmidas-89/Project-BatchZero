import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { CategoryPills } from "@/components/app/category-pills";
import { RoleToggle } from "@/components/app/role-toggle";
import { HomeView } from "@/components/home/home-view";
import { AppStateProvider } from "@/context/app-state";

function renderShell() {
  return render(
    <AppStateProvider>
      <RoleToggle />
      <CategoryPills />
      <HomeView />
    </AppStateProvider>,
  );
}

describe("HomeView", () => {
  it("swaps shopper content for founder content when the role changes", async () => {
    const user = userEvent.setup();
    renderShell();

    expect(
      screen.getByRole("heading", {
        name: "Back the batch. Not the guesswork.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Miso Morning Oat Bars")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Founder View" }));

    expect(
      screen.getByRole("heading", {
        name: "Prove demand before you produce.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", {
        name: "Back the batch. Not the guesswork.",
      }),
    ).not.toBeInTheDocument();
  });

  it("filters the visible batches by category", async () => {
    const user = userEvent.setup();
    renderShell();

    expect(screen.getByText("Barrier Repair Cream")).toBeInTheDocument();
    expect(screen.getByText("Linen Utility Set")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Food" }));

    expect(screen.getByText("Miso Morning Oat Bars")).toBeInTheDocument();
    expect(screen.queryByText("Barrier Repair Cream")).not.toBeInTheDocument();
    expect(screen.queryByText("Linen Utility Set")).not.toBeInTheDocument();
  });
});
