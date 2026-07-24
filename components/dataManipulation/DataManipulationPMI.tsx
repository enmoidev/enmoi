"use client";

// Génération du PMI — identité d'une personne, puis téléchargement du document

import { useState } from "react";
import Link from "next/link";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "react-hot-toast";
import { CircleCheck, FileDown, Loader2, TriangleAlert } from "lucide-react";
import { Label } from "../ui/label";
import { forceRoles } from "@/components/admin/forceRoles";

export default function DataManipulationPMI() {

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  // L'API nomme précisément ce qui bloque (visuel absent, formule hors bornes) :
  // ce message est affiché tel quel, le toast seul le faisait disparaître.
  const [apiError, setApiError] = useState<string | null>(null);
  const [lastFileName, setLastFileName] = useState<string | null>(null);

  const handleGeneratePMI = async () => {

    if (!firstName || !lastName || !birthPlace || !birthDate) {
      toast.error("Veuillez remplir tous les champs avant de générer le PMI.");
      return;
    }

    try {

      setLoading(true);
      setApiError(null);
      setLastFileName(null);

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

      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(
          payload?.error ?? "La génération du PMI a échoué. Réessayez dans un instant."
        );
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const fileName = `PMI_${firstName}_${lastName}.pdf`;
      link.href = url;
      link.download = fileName;
      link.click();

      setLastFileName(fileName);
      toast.success("PMI généré avec succès !");
    }

    catch (error) {
      console.error(error);
      const message =
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de la génération du PMI.";
      setApiError(message);
      toast.error(message);
    }

    finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <section
        aria-labelledby="pmi-form-title"
        className="border-line bg-paper shadow-sheet rounded-xl border p-5 md:p-6"
      >
        <h2 id="pmi-form-title" className="eyebrow text-brand-deep">
          Identité de la personne
        </h2>
        <p className="text-ink-muted mt-2 text-sm">
          Le prénom est surimprimé sur chaque page du document ; la date de naissance
          détermine les 7 forces. Tous les champs sont nécessaires.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="pmi-last-name" className="pb-2">
              Nom
            </Label>
            <Input
              id="pmi-last-name"
              className="bg-paper"
              autoComplete="family-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="pmi-first-name" className="pb-2">
              Prénom
            </Label>
            <Input
              id="pmi-first-name"
              className="bg-paper"
              autoComplete="given-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <p className="text-ink-muted mt-1.5 text-[0.8125rem]">
              Imprimé en haut à gauche du bandeau de chaque page A.
            </p>
          </div>

          <div>
            <Label htmlFor="pmi-birth-place" className="pb-2">
              Lieu de naissance
            </Label>
            <Input
              id="pmi-birth-place"
              className="bg-paper"
              value={birthPlace}
              onChange={(e) => setBirthPlace(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="pmi-birth-date" className="pb-2">
              Date de naissance
            </Label>
            <Input
              id="pmi-birth-date"
              type="date"
              className="bg-paper"
              onChange={(e) => setBirthDate(new Date(e.target.value))}
            />
          </div>
        </div>

        <div className="border-line mt-6 flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center">
          <Button onClick={handleGeneratePMI} disabled={loading} size="lg">
            {loading ? (
              <>
                <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
                Génération en cours…
              </>
            ) : (
              <>
                <FileDown aria-hidden="true" className="h-4 w-4" />
                Générer le PMI
              </>
            )}
          </Button>
          <p className="text-ink-muted text-[0.8125rem]">
            Le document fait une quinzaine de pages : comptez quelques secondes.
          </p>
        </div>

        {apiError && (
          <div
            role="alert"
            className="bg-alert-wash border-destructive/30 mt-5 rounded-lg border p-4"
          >
            <p className="text-destructive flex items-center gap-2 font-semibold">
              <TriangleAlert aria-hidden="true" className="h-4 w-4 shrink-0" />
              Le PMI n&apos;a pas été généré
            </p>
            <p className="text-destructive mt-2 text-sm">{apiError}</p>
            <Link
              href="/admin/forces"
              className="text-destructive mt-3 inline-block text-sm font-semibold underline underline-offset-4"
            >
              Vérifier la médiathèque des forces
            </Link>
          </div>
        )}

        {lastFileName && !apiError && (
          <div
            role="status"
            className="bg-brand-veil border-brand/30 mt-5 rounded-lg border p-4"
          >
            <p className="text-primary flex items-center gap-2 font-semibold">
              <CircleCheck aria-hidden="true" className="h-4 w-4 shrink-0" />
              Document téléchargé
            </p>
            <p className="text-ink-muted mt-1 text-sm">{lastFileName}</p>
          </div>
        )}
      </section>

      {/* Rappel de ce que le document contiendra, dans l'ordre des positions. */}
      <section
        aria-labelledby="pmi-structure-title"
        className="border-line bg-paper shadow-sheet rounded-xl border p-5 md:p-6"
      >
        <h2 id="pmi-structure-title" className="eyebrow text-brand-deep">
          Ce que contient le document
        </h2>
        <p className="text-ink-muted mt-2 text-sm">
          Les pages d&apos;introduction, puis deux pages par force, dans l&apos;ordre
          des 7 positions.
        </p>

        <ol className="mt-4">
          {forceRoles.map((role, index) => (
            <li key={role} className="flex items-baseline gap-3 py-1.5">
              <span className="text-brand font-display w-4 shrink-0 text-sm">
                {index + 1}
              </span>
              <span aria-hidden="true" className="leader-dots" />
              <span className="text-ink-muted shrink-0 text-sm">{role}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
