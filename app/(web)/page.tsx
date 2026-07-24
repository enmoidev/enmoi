// Accueil public — porte d'entrée sobre vers le back-office
//
// Ce n'est pas encore le site vitrine : tant que la présentation d'EnMoi n'est
// pas écrite, cette page ne sert qu'à donner accès à l'authentification.

import RedirectIfAuthenticatedServer from "@/lib/auth-utils/redirect-if-authenticated-server";
import Link from "next/link";
import { BrandMark } from "@/components/navbar/BrandMark";

export default async function Home() {
  await RedirectIfAuthenticatedServer();

  return (
    <div className="bg-desk flex min-h-screen flex-col">
      <header className="flex items-center justify-between gap-4 px-6 py-5 sm:px-10">
        <BrandMark className="text-brand-deep text-3xl" />

        <Link
          href="/auth/sign-in"
          className="bg-primary hover:bg-brand-deep focus-visible:ring-ring inline-flex h-10 items-center rounded-md px-5 text-sm font-semibold text-white transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          Se connecter
        </Link>
      </header>

      <main className="flex flex-1 items-center px-6 pb-24 sm:px-10">
        <div className="mx-auto w-full max-w-2xl">
          <div className="border-brand/40 border-l-2 pl-6">
            <p className="eyebrow text-brand-deep">Potentiel Mental Inné</p>

            <h1 className="font-display text-ink mt-4 text-[2rem] leading-tight sm:text-[2.75rem]">
              Révéler ce qui est déjà là.
            </h1>

            <p className="text-ink-muted mt-5 text-base leading-relaxed">
              EnMoi accompagne le développement personnel à partir de l&apos;inné et de
              l&apos;acquis. À partir d&apos;une date de naissance, sept forces mentales
              se dessinent et composent le PMI, votre document personnel.
            </p>
          </div>

          <p className="text-ink-muted mt-10 text-sm">
            Le site de présentation arrive prochainement. En attendant,{" "}
            <Link
              href="/auth/sign-in"
              className="text-brand-deep font-medium underline underline-offset-4"
            >
              connectez-vous à votre espace
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
