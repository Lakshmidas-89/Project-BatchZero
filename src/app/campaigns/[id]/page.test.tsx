import { render, screen } from "@testing-library/react";
import { type ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const notFoundMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({ notFound: notFoundMock }));

import CampaignPage, { generateStaticParams } from "./page";

describe("campaign detail route", () => {
  beforeEach(() => {
    notFoundMock.mockReset();
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  it("prerenders every known campaign id", () => {
    expect(generateStaticParams()).toEqual([
      { id: "miso-oat-bars" },
      { id: "barrier-repair-cream" },
      { id: "linen-utility-set" },
    ]);
  });

  it("renders the assembled detail page for the requested campaign", async () => {
    const element = (await CampaignPage({
      params: Promise.resolve({ id: "miso-oat-bars" }),
    })) as ReactElement;

    render(element);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Miso Morning Oat Bars",
    );
    expect(
      screen.getByRole("button", {
        name: "Pre-Book Batch #004 • ₹1,499 Token",
      }),
    ).toBeInTheDocument();
  });

  it("calls notFound for an unknown campaign id", async () => {
    await CampaignPage({
      params: Promise.resolve({ id: "unknown" }),
    });

    expect(notFoundMock).toHaveBeenCalledOnce();
  });
});
