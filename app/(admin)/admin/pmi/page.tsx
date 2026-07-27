// Génération du livrable d'une personne

import DataManipulationPMI from "@/components/dataManipulation/DataManipulationPMI";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const metadata = {
  title: "Générer un livrable",
};

export default function AdminPMIPage() {
  return (
    <>
      <AdminPageHeader
        eyebrow="Livrable"
        title="Générer un livrable"
        backHref="/admin"
        description="Le livrable d'une personne : pages d'introduction personnalisées, puis deux pages pour chacune de ses 7 forces."
      />

      <DataManipulationPMI />
    </>
  );
}
