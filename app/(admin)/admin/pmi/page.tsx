"use client"

import DataManipulationPMI from "@/components/dataManipulation/DataManipulationPMI";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminPMIPage() {
  const router = useRouter();

  return (
    <main className="flex flex-col">

      <div className="flex items-center gap-4 mb-6">
        <Button type="button" variant="outline" onClick={() => router.push("/admin")}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-medium tracking-wide">Générer des PMI</h1>
      </div>

      <DataManipulationPMI/>

    </main>
  );
}
