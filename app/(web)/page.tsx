// Accueil public — emplacement réservé au futur site vitrine
//
// La présentation d'enMOI n'est pas encore écrite. Cette page tient donc deux
// rôles : signaler visiblement au client que c'est ici que viendra le site
// vitrine, et donner accès à l'authentification pour le back-office.

import RedirectIfAuthenticatedServer from "@/lib/auth-utils/redirect-if-authenticated-server";
import Link from "next/link";
import { BrandLogo } from "@/components/navbar/BrandLogo";

export default async function Home() {
  await RedirectIfAuthenticatedServer();

  return (
    <div className="bg-desk flex min-h-screen flex-col">
      <header className="flex items-center justify-between gap-4 px-6 py-5 sm:px-10">
        <BrandLogo height={40} priority />

        <Link
          href="/auth/sign-in"
          className="bg-primary hover:bg-brand-deep focus-visible:ring-ring inline-flex h-10 items-center rounded-md px-5 text-sm font-semibold text-white transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          Se connecter
        </Link>
      </header>

      <main className="flex flex-1 items-center px-6 pb-24 sm:px-10">
        <div className="mx-auto w-full max-w-2xl">
          {/* Cartouche « emplacement réservé » : le client doit comprendre au
              premier coup d'œil que le site vitrine prendra place ici. */}
          <div className="border-line bg-paper shadow-sheet rounded-xl border border-dashed p-8 sm:p-10">
            <p className="eyebrow text-brand-deep">Site vitrine</p>

            <h1 className="font-display text-ink mt-4 text-[1.75rem] leading-tight sm:text-[2.25rem]">
              La présentation d&apos;enMOI prendra place ici.
            </h1>

            <p className="text-ink-muted mt-5 text-base leading-relaxed">
              Cet espace accueillera le site vitrine : la présentation de la démarche
              inné-acquis, des 7 forces mentales et du livrable remis à chaque personne.
              Il reste à concevoir dans une prochaine étape.
            </p>

            <p className="text-ink-muted mt-3 text-base leading-relaxed">
              En attendant, le back-office est accessible via le bouton{" "}
              <span className="text-ink font-medium">Se connecter</span>.
            </p>
          </div>

          <p className="text-ink-muted mt-6 text-sm">
            Espace réservé — page provisoire, non indexée par les moteurs de recherche.
          </p>
        </div>
      </main>
    </div>
  );
}
