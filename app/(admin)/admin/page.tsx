// Tableau de bord du back-office : accès aux quatre écrans et rappel des 7 rôles

import { FileDown, Images, Sigma, SlidersHorizontal, type LucideIcon } from "lucide-react";
import LinkNavCard from "../../../components/ui/LinkNavCard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { forceRoles } from "@/components/admin/forceRoles";
import { NavInfoCard } from "../../../types/navInfoCard";

// Le champ `d` du type historique laisse place à une icône lucide.
type DashboardCard = Omit<NavInfoCard, "d"> & {
  icon: LucideIcon;
  featured?: boolean;
};

export default function AdminHomePage() {
  const navInfoCards: DashboardCard[] = [
    {
      title: "Médiathèque des forces",
      shortDescription: "Les 200 visuels des 100 forces",
      content:
        "Déposez et remplacez les deux pages PNG de chaque force. Une force n'entre dans un miroir que lorsque ses deux pages sont présentes : l'écran indique combien de forces sont complètes.",
      href: "/admin/forces",
      icon: Images,
      featured: true,
    },
    {
      title: "Formules",
      shortDescription: "Les 7 expressions de calcul",
      content:
        "Modifiez l'expression d'une formule et vérifiez-la immédiatement : une date de naissance suffit à obtenir les 7 numéros des forces correspondantes.",
      href: "/admin/formules",
      icon: Sigma,
    },
    {
      title: "Générer un miroir",
      shortDescription: "Le document d'une personne",
      content:
        "Renseignez l'identité et la date de naissance d'une personne. Les 7 forces sont calculées, leurs visuels assemblés, et le PDF se télécharge.",
      href: "/admin/pmi",
      icon: FileDown,
    },
    {
      title: "Paramètres",
      shortDescription: "Réglages globaux",
      content:
        "Définissez le nombre de comptes ambassadeur disponibles. Ce réglage s'applique à toute l'application.",
      href: "/admin/settings",
      icon: SlidersHorizontal,
    },
  ];

  return (
    <>
      <AdminPageHeader
        eyebrow="Espace administrateur"
        title="Tableau de bord"
        description="Tout ce qu'il faut pour préparer et produire un Miroir enMOI."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {navInfoCards.map((card) => (
          <LinkNavCard key={card.title} {...card} />
        ))}
      </div>

      {/* Repère métier permanent : la position dans les 7 détermine le rôle,
          c'est la valeur surimprimée en page B du document. */}
      <section
        aria-labelledby="roles-title"
        className="border-line bg-paper shadow-sheet mt-6 rounded-xl border p-5 md:p-6"
      >
        <h2 id="roles-title" className="eyebrow text-brand-deep">
          Les 7 rôles symboliques
        </h2>
        <p className="text-ink-muted mt-2 text-sm">
          Le rôle imprimé sur la page B dépend de la position dans les 7, jamais du
          numéro de la force.
        </p>

        <ol className="mt-4 grid gap-x-8 gap-y-1 sm:grid-cols-2">
          {forceRoles.map((role, index) => (
            <li key={role} className="flex items-baseline gap-3 py-1.5">
              <span className="text-brand font-display w-4 shrink-0 text-sm">
                {index + 1}
              </span>
              {/* Le filet de conduite pointillé du document imprimé. */}
              <span aria-hidden="true" className="leader-dots" />
              <span className="text-ink shrink-0 text-[0.9375rem]">{role}</span>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
