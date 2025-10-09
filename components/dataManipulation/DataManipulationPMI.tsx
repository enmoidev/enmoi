"use client";

import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { toast } from "react-hot-toast";
import { FileDown, Loader2 } from "lucide-react";
import { Label } from "../ui/label";

export default function DataManipulationPMI() {

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGeneratePMI = async () => {

    if (!firstName || !lastName || !birthPlace || !birthDate) {
      toast.error("Veuillez remplir tous les champs avant de générer le PMI.");
      return;
    }

    try {

      setLoading(true);

      const res = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName,
          lastName: lastName,
          birthPlace: birthPlace,
          birthDate: birthDate.toISOString().split("T")[0],
        }),
      });

      if (!res.ok) throw new Error("Erreur lors de la génération du PDF");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `PMI_${firstName}_${lastName}.pdf`;
      link.click();

      toast.success("PMI généré avec succès !");
    } 
    
    catch (error) {
      console.error(error);
      toast.error("Une erreur est survenue lors de la génération du PMI.");
    } 
    
    finally {
      setLoading(false);
    }
  };

  return (

    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl text-neutral-700">
          Génération du document PMI complet
        </CardTitle>
        <p className="text-neutral-700">
          Indiquer les informations du client inYou et générer son document PMI complet.
        </p>
      </CardHeader>

      <CardContent className="space-y-8">
        <hr className="border-t border-gray-300" />

        {/* Étape 1 : Informations personnelles */}
        <section>
          <h2 className="text-lg font-semibold mb-2 text-primary italic">
            Étape 1 : Renseigner les informations personnelles du client
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="pb-2">Nom</Label>
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>

            <div>
              <Label className="pb-2">Prénom</Label>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>

            <div>
              <Label className="pb-2">Lieu de naissance</Label>
              <Input value={birthPlace} onChange={(e) => setBirthPlace(e.target.value)} />
            </div>

            <div>
              <Label className="pb-2">Date de naissance</Label>
              <Input type="date" onChange={(e) => setBirthDate(new Date(e.target.value))} />
            </div>
          </div>
        </section>

        <hr className="border-t border-gray-300" />

        {/* Étape 2 : Génération du PDF */}
        <section className="flex flex-col">
          <h2 className="text-lg font-semibold mb-2 text-primary italic">
            Étape 2 : Générer le PMI complet
          </h2>
          <Button
            onClick={handleGeneratePMI}
            disabled={loading}
            className="mt-2 w-auto self-center flex items-center gap-2 justify-center"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> <span className="pb-1">Génération en cours...</span>
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4" /> <span className="pb-1">Générer le document PMI complet</span>
              </>
            )}
          </Button>
        </section>
      </CardContent>
    </Card>
  );
}
