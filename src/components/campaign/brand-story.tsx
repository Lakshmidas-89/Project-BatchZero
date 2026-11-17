import { SectionHeading } from "@/components/ui/section-heading";
import type { CampaignDetail } from "@/lib/campaign-details";

export function BrandStory({
  title,
  detail,
}: {
  title: string;
  detail: CampaignDetail;
}) {
  return (
    <section className="rounded-3xl border border-line bg-card p-5 sm:p-7">
      <SectionHeading eyebrow="The Story" title={title} />

      <div className="mt-5 space-y-3">
        {detail.story.map((paragraph) => (
          <p key={paragraph} className="text-sm leading-7 text-muted">
            {paragraph}
          </p>
        ))}
      </div>

      <div className="mt-7">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand">
          Ingredients &amp; materials
        </h3>
        <dl className="mt-3 grid gap-x-8 gap-y-0 sm:grid-cols-2">
          {detail.specs.map((spec) => (
            <div
              key={spec.label}
              className="flex items-center justify-between gap-4 border-b border-line py-3"
            >
              <dt className="text-xs font-medium text-muted">{spec.label}</dt>
              <dd className="text-right text-xs font-semibold text-ink">
                {spec.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
