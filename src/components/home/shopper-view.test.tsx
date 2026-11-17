import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ShopperView } from "./shopper-view";
import { AppStateProvider } from "@/context/app-state";

describe("shopper campaign cards", () => {
  it("links every campaign card to its detail page", () => {
    render(
      <AppStateProvider>
        <ShopperView />
      </AppStateProvider>,
    );

    const detailLinks = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("href")?.startsWith("/campaigns/"));

    expect(detailLinks.map((link) => link.getAttribute("href"))).toEqual([
      "/campaigns/miso-oat-bars",
      "/campaigns/barrier-repair-cream",
      "/campaigns/linen-utility-set",
    ]);
    expect(screen.getAllByText("View batch details")).toHaveLength(3);
  });
});
