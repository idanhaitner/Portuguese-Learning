import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export function PageHeader({
  title,
  titleLang,
  sub,
  back,
  actions,
}: {
  title: string;
  titleLang?: string;
  sub?: ReactNode;
  back?: { to: string; label: string };
  actions?: ReactNode;
}) {
  return (
    <header>
      {back ? (
        <Link to={back.to} className="mb-5 inline-flex items-center gap-1.5 text-[var(--t-sm)] font-semibold text-muted hover:text-ink">
          <ArrowLeft size={15} strokeWidth={2} />
          {back.label}
        </Link>
      ) : null}
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-5">
        <div className="min-w-0">
          <h1 lang={titleLang} className="pt text-[40px] leading-[0.95] sm:text-[var(--t-2xl)] lg:text-[60px]">
            {title}
          </h1>
          {sub ? <div className="mt-3 max-w-[68ch] text-[var(--t-base)] text-muted">{sub}</div> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
