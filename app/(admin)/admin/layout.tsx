// Coquille du back-office : bandeau de navigation à gauche, plan de travail à droite

import React, { ReactNode } from "react";
import { getAuthSession } from "../../../lib/auth-utils/getAuthSession";
import { redirect } from "next/navigation";
import { NavbarDesktopAdmin } from "@/components/navbar/NavbarDesktopAdmin";
import { NavbarMobileAdmin } from "@/components/navbar/NavbarMobileAdmin";

interface AdminLayoutProps {
  children: ReactNode;
}

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await getAuthSession();

  if (session.user.role !== "ADMIN") {
    return redirect("/auth/sign-in");
  }

  return (
    // Une grille remplace la marge en dur : la largeur du bandeau n'est
    // déclarée qu'à un seul endroit.
    <div className="bg-desk text-ink min-h-screen md:grid md:grid-cols-[17rem_minmax(0,1fr)]">
      <a
        href="#admin-content"
        className="bg-primary sr-only rounded-md px-4 py-2 text-white focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[60]"
      >
        Aller au contenu
      </a>

      <div className="hidden md:block">
        <NavbarDesktopAdmin user={session.user} />
      </div>

      <NavbarMobileAdmin user={session.user} />

      <main
        id="admin-content"
        className="min-w-0 px-4 pt-[calc(4rem+1.5rem)] pb-16 sm:px-6 md:px-10 md:pt-10 md:pb-14"
      >
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
