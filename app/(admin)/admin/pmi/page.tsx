// Génération du livrable d'une personne

import DataManipulationPMI from "@/components/dataManipulation/DataManipulationPMI";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const metadata = {
  title: "Générer un miroir",
};

export default function AdminPMIPage() {
  return (
    <>
      <AdminPageHeader
        eyebrow="Miroir enMOI"
        title="Générer un miroir"
        backHref="/admin"
        description="Le Miroir enMOI d'une personne : pages d'introduction personnalisées, puis deux pages pour chacune de ses 7 forces."
      />

      <DataManipulationPMI />
    </>
  );
}
