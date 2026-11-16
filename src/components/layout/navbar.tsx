import { Boxes } from "lucide-react";
import Link from "next/link";

import { CategoryPills } from "@/components/app/category-pills";
import { RoleToggle } from "@/components/app/role-toggle";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-x-2 gap-y-3 px-4 py-3 sm:gap-x-6 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:px-8">
        <Link
          href="/"
          className="group flex w-fit min-w-0 items-center gap-2 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 sm:gap-2.5"
          aria-label="BatchZero home"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand text-white shadow-sm ring-1 ring-brand/20 transition-transform duration-200 group-hover:-rotate-3 sm:size-10">
            <Boxes className="size-5" strokeWidth={2.2} aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="flex items-center gap-1.5">
              <span className="text-base font-bold tracking-tight text-ink sm:text-lg">
                BatchZero
              </span>
              <span className="rounded-full border border-brand/20 bg-brand-soft px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.18em] text-brand">
                BETA
              </span>
            </span>
            <span className="block truncate text-[9px] font-medium leading-3 text-muted sm:text-[11px] sm:leading-normal">
              Validate Before You Manufacture
            </span>
          </span>
        </Link>

        <div className="order-3 w-full lg:order-none lg:col-start-2 lg:w-auto lg:justify-self-center">
          <CategoryPills />
        </div>

        <div className="order-2 lg:order-none lg:col-start-3 lg:justify-self-end">
          <RoleToggle />
        </div>
      </div>
    </header>
  );
}
