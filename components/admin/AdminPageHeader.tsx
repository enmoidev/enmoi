// En-tête commun aux écrans du back-office : surtitre, titre, description, retour

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  /// Surtitre en capitales sérif, repris des intitulés institutionnels du PMI.
  eyebrow: string;
  title: string;
  description?: ReactNode;
  /// Affiche le retour au tableau de bord. Absent sur le tableau de bord lui-même.
  backHref?: string;
  /// Actions alignées à droite du titre (boutons, compteurs).
  actions?: ReactNode;
};

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  backHref,
  actions,
}: Props) {
  return (
    <header className="mb-8">
      {backHref && (
        <Link
          href={backHref}
          className="text-ink-muted hover:text-primary mb-4 inline-flex items-center gap-1 rounded-md text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
        >
          <ChevronLeft aria-hidden="true" className="h-4 w-4" />
          Retour au tableau de bord
        </Link>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        {/* Le filet vertical turquoise en marge du bloc de titre, comme en page A. */}
        <div className="editorial-rule min-w-0 pl-4">
          <p className="eyebrow text-brand-deep">{eyebrow}</p>
          <h1 className="font-display text-ink mt-2 text-[1.75rem] leading-tight md:text-[2rem]">
            {title}
          </h1>
          {description && (
            <p className="text-ink-muted mt-2 max-w-2xl text-[0.9375rem]">
              {description}
            </p>
          )}
        </div>

        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
