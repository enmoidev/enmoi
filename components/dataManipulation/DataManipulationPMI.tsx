"use client";

// Génération du livrable — identité d'une personne, puis téléchargement du document

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "react-hot-toast";
import { CircleCheck, FileDown, Loader2, TriangleAlert } from "lucide-react";
import { Label } from "../ui/label";
import { forceRoles } from "@/components/admin/forceRoles";
import type { ForceType } from "@/types/modelPrisma";
import { isForceComplete } from "@/types/modelPrisma";
import { DELIVERABLES, DELIVERABLE_IDS, pageCount } from "@/lib/generate-pdf/deliverables";
import type { DeliverableId } from "@/types/pdf";

/// Deux façons de choisir les 7 forces : par la date de naissance (réel) ou en
/// les désignant à la main (test, pour valider l'assemblage sans les formules).
type Mode = "birthDate" | "manual";

export default function DataManipulationPMI() {

  const [mode, setMode] = useState<Mode>("birthDate");
  const [deliverable, setDeliverable] = useState<DeliverableId>("livrable2");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  // Heure « HH:MM », facultative : le client la note « si connue ».
  const [birthTime, setBirthTime] = useState("");
  // Numéro de force choisi pour chacune des 7 positions (mode test).
  const [chosenForces, setChosenForces] = useState<(number | null)[]>(
    () => Array(7).fill(null)
  );
  const [completeForces, setCompleteForces] = useState<ForceType[]>([]);
  const [loading, setLoading] = useState(false);
  // L'API nomme précisément ce qui bloque (visuel absent, formule hors bornes) :
  // ce message est affiché tel quel, le toast seul le faisait disparaître.
  const [apiError, setApiError] = useState<string | null>(null);
  const [lastFileName, setLastFileName] = useState<string | null>(null);

  // Les forces sélectionnables en mode test sont celles dont les deux visuels
  // sont déposés : inutile d'en proposer une qui ferait échouer la génération.
  const loadCompleteForces = useCallback(async () => {
    try {
      const res = await fetch("/api/forces");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Chargement impossible.");
      setCompleteForces((data.forces as ForceType[]).filter(isForceComplete));
    } catch {
      // Silencieux : le mode test reste utilisable en saisissant les numéros,
      // et le mode date de naissance n'en dépend pas.
    }
  }, []);

  useEffect(() => {
    loadCompleteForces();
  }, [loadCompleteForces]);

  const setChosenAt = (index: number, value: number | null) => {
    setChosenForces((current) => current.map((n, i) => (i === index ? value : n)));
  };

  const handleGeneratePMI = async () => {

    if (!firstName || !lastName || !birthPlace) {
      toast.error("Renseignez au moins le nom, le prénom et le lieu de naissance.");
      return;
    }

    if (mode === "birthDate" && !birthDate) {
      toast.error("Veuillez renseigner la date de naissance.");
      return;
    }

    if (mode === "manual" && chosenForces.some((n) => n === null)) {
      toast.error("Choisissez une force pour chacune des 7 positions.");
      return;
    }

    try {

      setLoading(true);
      setApiError(null);
      setLastFileName(null);

      const identity = {
        deliverable,
        firstName,
        lastName,
        birthPlace,
        ...(birthTime ? { birthTime } : {}),
      };

      const body =
        mode === "manual"
          ? { ...identity, forceNumbers: chosenForces as number[] }
          : { ...identity, birthDate: birthDate!.toISOString().split("T")[0] };

      const res = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(
          payload?.error ?? "La génération du livrable a échoué. Réessayez dans un instant."
        );
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const fileName = `${deliverable}_${firstName}_${lastName}.pdf`;
      link.href = url;
      link.download = fileName;
      link.click();

      setLastFileName(fileName);
      toast.success("Livrable généré avec succès !");
    }

    catch (error) {
      console.error(error);
      const message =
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de la génération du livrable.";
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
          Le prénom est surimprimé sur chaque page du document. Les 7 forces sont
          déterminées par la date de naissance, ou choisies à la main pour un test.
        </p>

        {/* Choix du livrable : c'est lui qui fixe la composition du document. */}
        <div className="mt-5">
          <Label htmlFor="pmi-deliverable" className="pb-2">
            Livrable
          </Label>
          <select
            id="pmi-deliverable"
            className="border-input bg-paper h-9 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            value={deliverable}
            onChange={(e) => setDeliverable(e.target.value as DeliverableId)}
          >
            {DELIVERABLE_IDS.map((id) => (
              <option key={id} value={id}>
                {DELIVERABLES[id].label}
              </option>
            ))}
          </select>
          <p className="text-ink-muted mt-1.5 text-[0.8125rem]">
            {pageCount(DELIVERABLES[deliverable])} pages,{" "}
            {DELIVERABLES[deliverable].detailedForceCount === 1
              ? "1 seule force développée"
              : "les 7 forces développées"}
            . Les 7 sont nommées sur la roue dans tous les cas.
          </p>
        </div>

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
            <Label htmlFor="pmi-birth-time" className="pb-2">
              Heure de naissance{" "}
              <span className="text-ink-muted font-normal">(facultative)</span>
            </Label>
            <Input
              id="pmi-birth-time"
              type="time"
              className="bg-paper"
              value={birthTime}
              onChange={(e) => setBirthTime(e.target.value)}
            />
            <p className="text-ink-muted mt-1.5 text-[0.8125rem]">
              Imprimée sur la couverture. N&apos;entre dans aucune formule.
            </p>
          </div>
        </div>

        {/* Choix du mode de sélection des 7 forces. */}
        <div className="border-line mt-6 border-t pt-5">
          <div className="flex gap-1 rounded-md border border-neutral-200 p-1">
            {(
              [
                ["birthDate", "Par date de naissance"],
                ["manual", "Choix manuel (test)"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value)}
                className={`flex-1 rounded px-3 py-1.5 text-sm transition-colors ${
                  mode === value
                    ? "bg-primary text-white"
                    : "text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {mode === "birthDate" ? (
            <div className="mt-4 max-w-xs">
              <Label htmlFor="pmi-birth-date" className="pb-2">
                Date de naissance
              </Label>
              <Input
                id="pmi-birth-date"
                type="date"
                className="bg-paper"
                onChange={(e) => setBirthDate(new Date(e.target.value))}
              />
              <p className="text-ink-muted mt-1.5 text-[0.8125rem]">
                Les 7 formules la transforment en 7 numéros de forces.
              </p>
            </div>
          ) : (
            <div className="mt-4">
              <p className="text-ink-muted text-[0.8125rem]">
                Choisissez la force placée à chaque position. Seules les forces dont
                les deux visuels sont déposés sont proposées
                {completeForces.length > 0 ? ` (${completeForces.length} disponibles)` : ""}.
              </p>

              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {forceRoles.map((role, index) => (
                  <div key={role}>
                    <Label htmlFor={`pmi-force-${index}`} className="pb-2">
                      <span className="text-brand font-display mr-1.5">{index + 1}</span>
                      {role}
                    </Label>
                    <select
                      id={`pmi-force-${index}`}
                      className="border-input bg-paper h-9 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                      value={chosenForces[index] ?? ""}
                      onChange={(e) =>
                        setChosenAt(index, e.target.value ? Number(e.target.value) : null)
                      }
                    >
                      <option value="">— Choisir une force —</option>
                      {completeForces.map((force) => (
                        <option key={force.id} value={force.number}>
                          {force.number}. {force.title}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {completeForces.length === 0 && (
                <p className="text-destructive mt-3 text-[0.8125rem]">
                  Aucune force complète pour l&apos;instant. Déposez d&apos;abord des
                  visuels depuis la médiathèque.
                </p>
              )}
            </div>
          )}
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
                Générer le livrable
              </>
            )}
          </Button>
          <p className="text-ink-muted text-[0.8125rem]">
            Le document fait {pageCount(DELIVERABLES[deliverable])} pages : comptez
            quelques secondes.
          </p>
        </div>

        {apiError && (
          <div
            role="alert"
            className="bg-alert-wash border-destructive/30 mt-5 rounded-lg border p-4"
          >
            <p className="text-destructive flex items-center gap-2 font-semibold">
              <TriangleAlert aria-hidden="true" className="h-4 w-4 shrink-0" />
              Le livrable n&apos;a pas été généré
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
          {DELIVERABLES[deliverable].before.length} pages d&apos;introduction, puis
          deux pages par force développée, puis{" "}
          {DELIVERABLES[deliverable].after.length} pages de méthode.
          {DELIVERABLES[deliverable].detailedForceCount === 1 &&
            " Seule la force en position 1 est développée."}
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
