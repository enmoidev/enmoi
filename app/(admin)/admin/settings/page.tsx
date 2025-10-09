"use client"

import DataManipulationGlobalSettings from "@/components/dataManipulation/DataManipulationGlobalSettings";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminSettingsPage() {
  const router = useRouter();

  return (
    <main className="flex flex-col">

      <div className="flex items-center gap-4 mb-6">
        <Button type="button" variant="outline" onClick={() => router.push("/admin")}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-medium tracking-wide">Paramètres globaux</h1>
      </div>

      <DataManipulationGlobalSettings/>

    </main>
  );
}
