// Génération du document PMI d'une personne

import DataManipulationPMI from "@/components/dataManipulation/DataManipulationPMI";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const metadata = {
  title: "Générer un PMI",
};

export default function AdminPMIPage() {
  return (
    <>
      <AdminPageHeader
        eyebrow="Livrable"
        title="Générer un PMI"
        backHref="/admin"
        description="Le Potentiel Mental Inné d'une personne : pages d'introduction personnalisées, puis deux pages pour chacune de ses 7 forces."
      />

      <DataManipulationPMI />
    </>
  );
}
