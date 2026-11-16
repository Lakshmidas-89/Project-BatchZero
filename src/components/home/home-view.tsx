"use client";

import { EscrowFlow } from "@/components/home/escrow-flow";
import { FounderView } from "@/components/home/founder-view";
import { RoleStats } from "@/components/home/role-stats";
import { ShopperView } from "@/components/home/shopper-view";
import { ViewHero } from "@/components/home/view-hero";
import { useAppState } from "@/context/app-state";

export function HomeView() {
  const { role } = useAppState();

  return (
    <div
      key={role}
      className="motion-safe:animate-[view-in_240ms_ease-out] space-y-6 sm:space-y-8"
    >
      <ViewHero role={role} />
      <RoleStats role={role} />
      {role === "shopper" ? <ShopperView /> : <FounderView />}
      <EscrowFlow />
    </div>
  );
}
