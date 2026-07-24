// Paramètres globaux de l'application

import DataManipulationGlobalSettings from "@/components/dataManipulation/DataManipulationGlobalSettings";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const metadata = {
  title: "Paramètres",
};

export default function AdminSettingsPage() {
  return (
    <>
      <AdminPageHeader
        eyebrow="Configuration"
        title="Paramètres globaux"
        backHref="/admin"
        description="Les réglages qui s'appliquent à l'ensemble de l'application."
      />

      <DataManipulationGlobalSettings />
    </>
  );
}
