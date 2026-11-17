import { render, screen } from "@testing-library/react";
import { type ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const notFoundMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({ notFound: notFoundMock }));

import CampaignPage, { generateStaticParams } from "./page";

describe("campaign detail route", () => {
  beforeEach(() => {
    notFoundMock.mockReset();
  });

  it("prerenders every known campaign id", () => {
    expect(generateStaticParams()).toEqual([
      { id: "miso-oat-bars" },
      { id: "barrier-repair-cream" },
      { id: "linen-utility-set" },
    ]);
  });

  it("renders the requested campaign detail", async () => {
    const element = (await CampaignPage({
      params: Promise.resolve({ id: "miso-oat-bars" }),
    })) as ReactElement;

    render(element);

    expect(screen.getByTestId("campaign-detail")).toHaveAttribute(
      "data-id",
      "miso-oat-bars",
    );
  });

  it("calls notFound for an unknown campaign id", async () => {
    await CampaignPage({
      params: Promise.resolve({ id: "unknown" }),
    });

    expect(notFoundMock).toHaveBeenCalledOnce();
  });
});
