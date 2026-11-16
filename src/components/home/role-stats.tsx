import {
  Clock3,
  Landmark,
  Layers3,
  ReceiptText,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";

import { Stat, type StatTone } from "@/components/ui/stat";
import type { Role } from "@/context/app-state";

type RoleStat = {
  label: string;
  value: string;
  meta: string;
  icon: typeof ShieldCheck;
  tone: StatTone;
};

const ROLE_STATS: Record<Role, RoleStat[]> = {
  shopper: [
    {
      label: "Escrow protected",
      value: "100%",
      meta: "Released only when a batch is funded",
      icon: ShieldCheck,
      tone: "fund",
    },
    {
      label: "Missed minimum",
      value: "Auto refund",
      meta: "Backers are made whole",
      icon: RotateCcw,
      tone: "alert",
    },
    {
      label: "Backer fee",
      value: "$0",
      meta: "Join any batch for free",
      icon: ReceiptText,
      tone: "brand",
    },
  ],
  founder: [
    {
      label: "In escrow",
      value: "$28,354",
      meta: "Across three live batches",
      icon: Landmark,
      tone: "fund",
    },
    {
      label: "Active batches",
      value: "3 live",
      meta: "2 funded · 1 needs attention",
      icon: Layers3,
      tone: "brand",
    },
    {
      label: "Next deadline",
      value: "2 days",
      meta: "Linen Utility Set",
      icon: Clock3,
      tone: "alert",
    },
  ],
};

export function RoleStats({ role }: { role: Role }) {
  return (
    <section
      aria-label={role === "shopper" ? "Shopper guarantees" : "Founder overview"}
      className="grid gap-3 sm:grid-cols-3"
    >
      {ROLE_STATS[role].map((stat) => (
        <Stat key={stat.label} {...stat} />
      ))}
    </section>
  );
}
