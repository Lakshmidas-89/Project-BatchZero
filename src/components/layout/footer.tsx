import { Boxes } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-md bg-brand text-white">
            <Boxes className="size-3.5" strokeWidth={2.2} aria-hidden="true" />
          </span>
          <span className="font-semibold text-ink">BatchZero</span>
          <span aria-hidden="true" className="text-line">
            /
          </span>
          <span>Validate Before You Manufacture</span>
        </div>
        <p>
          BatchZero <span aria-hidden="true">—</span> Built by{" "}
          <span className="font-semibold text-ink">Team Nexvoid</span>
        </p>
      </div>
    </footer>
  );
}
