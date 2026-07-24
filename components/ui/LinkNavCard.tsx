// Carte de navigation du tableau de bord, vers un écran du back-office

import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { NavInfoCard } from "../../types/navInfoCard";

type Props = Omit<NavInfoCard, "d"> & {
  icon: LucideIcon;
  /// Met la carte en avant : elle occupe deux colonnes et adopte le lavis turquoise.
  featured?: boolean;
};

export default function LinkNavCard({
  title,
  shortDescription,
  content,
  href,
  icon: Icon,
  featured = false,
}: Props) {
  return (
    <Link
      href={href}
      className="group block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
    >
      <Card
        className={`border-line hover:border-brand h-full gap-4 py-5 transition-colors duration-200 ${
          featured ? "bg-brand-veil" : ""
        }`}
      >
        <CardHeader className="gap-0 px-5">
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="bg-brand-wash text-brand-deep flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
            >
              <Icon className="h-5 w-5" />
            </span>

            <div className="min-w-0">
              <CardTitle className="font-display text-ink text-xl leading-snug">
                {title}
              </CardTitle>
              <p className="eyebrow text-brand-deep mt-1.5 opacity-80">
                {shortDescription}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 px-5">
          <p className="text-ink-muted text-[0.9375rem]">{content}</p>

          <span className="text-primary inline-flex items-center gap-1.5 text-sm font-semibold">
            Ouvrir
            <ArrowRight
              aria-hidden="true"
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
            />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
