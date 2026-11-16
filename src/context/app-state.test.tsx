import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { CategoryPills } from "@/components/app/category-pills";
import { RoleToggle } from "@/components/app/role-toggle";
import { AppStateProvider, useAppState } from "@/context/app-state";

function StateProbe() {
  const { role, category } = useAppState();

  return <output data-testid="state">{`${role}:${category}`}</output>;
}

describe("role and category state", () => {
  it("switches to the founder view in one click", async () => {
    const user = userEvent.setup();

    render(
      <AppStateProvider>
        <RoleToggle />
        <StateProbe />
      </AppStateProvider>,
    );

    expect(screen.getByTestId("state")).toHaveTextContent("shopper:All");

    await user.click(screen.getByRole("button", { name: "Founder View" }));

    expect(screen.getByTestId("state")).toHaveTextContent("founder:All");
  });

  it("filters to the selected category in one click", async () => {
    const user = userEvent.setup();

    render(
      <AppStateProvider>
        <CategoryPills />
        <StateProbe />
      </AppStateProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Skincare" }));

    expect(screen.getByTestId("state")).toHaveTextContent("shopper:Skincare");
  });
});
