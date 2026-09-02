// Médiathèque des forces — dépôt des visuels par le client

import DataManipulationForces from "@/components/dataManipulation/DataManipulationForces";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const metadata = {
  title: "Médiathèque des forces",
};

export default function AdminForcesPage() {
  return (
    <>
      <AdminPageHeader
        eyebrow="Visuels du miroir"
        title="Médiathèque des forces"
        backHref="/admin"
        description="Chaque force se compose de deux pages fournies en PNG, au format A4 à 300 DPI (2480 × 3508 px). Une force n'entre dans un miroir que lorsque ses deux pages sont déposées."
      />

      <DataManipulationForces />
    </>
  );
}
