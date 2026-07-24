// Layout de l'espace utilisateur — coquille minimale en attendant la phase dédiée
//
// L'implémentation précédente était un copier-coller du layout admin : elle
// exigeait le rôle ADMIN et affichait la navigation du back-office, ce qui rendait
// l'espace utilisateur inaccessible à un CUSTOMER. On se contente ici d'exiger une
// session valide ; la navigation propre à cet espace viendra avec ses écrans.

import React, { ReactNode } from "react";
import { getAuthSession } from "@/lib/auth-utils/getAuthSession";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function CustomerLayout({ children }: { children: ReactNode }) {
  // getAuthSession lève si aucune session n'est valide : l'accès est donc réservé
  // aux utilisateurs authentifiés, quel que soit leur rôle.
  await getAuthSession();

  return <div className="min-h-screen">{children}</div>;
}
