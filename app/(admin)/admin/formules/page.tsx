// Édition des 7 formules mathématiques

import DataManipulationFunctions from "@/components/dataManipulation/DataManipulationFunctions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const metadata = {
  title: "Formules",
};

export default function AdminFormulesPage() {
  return (
    <>
      <AdminPageHeader
        eyebrow="Calcul des forces"
        title="Formules"
        backHref="/admin"
        description="Les 7 expressions qui transforment une date de naissance en 7 numéros des forces. Une modification s'applique à tous les miroirs générés ensuite."
      />

      <DataManipulationFunctions />
    </>
  );
}
