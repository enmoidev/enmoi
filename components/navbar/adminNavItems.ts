// Entrées de navigation du back-office, partagées par les barres desktop et mobile

import {
  FileDown,
  Images,
  LayoutDashboard,
  Sigma,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  /// Précision affichée sous le libellé sur mobile, où la place le permet.
  hint: string;
  icon: LucideIcon;
};

export const adminNavItems: AdminNavItem[] = [
  {
    href: "/admin",
    label: "Tableau de bord",
    hint: "Vue d'ensemble",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/forces",
    label: "Médiathèque des forces",
    hint: "Les 200 visuels",
    icon: Images,
  },
  {
    href: "/admin/formules",
    label: "Formules",
    hint: "Les 7 expressions",
    icon: Sigma,
  },
  {
    href: "/admin/pmi",
    label: "Générer un livrable",
    hint: "Document d'une personne",
    icon: FileDown,
  },
  {
    href: "/admin/settings",
    label: "Paramètres",
    hint: "Réglages globaux",
    icon: SlidersHorizontal,
  },
];
