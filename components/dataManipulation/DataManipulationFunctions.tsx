"use client";

// Gestion des 7 formules — édition d'une expression et banc d'essai sur une date

import { useEffect, useState } from "react";
import Image from "next/image";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { toast } from "react-hot-toast";
import { Calculator, ChevronDown, Loader2, Save, TriangleAlert } from "lucide-react";
import { buildBirthVariables, evaluateFormula } from "@/lib/computeFunctions/computeFunctions";
import {
  describeRange,
  isDefaultSet,
  selectFormulaSet,
} from "@/lib/computeFunctions/formulaSets";
import { Label } from "../ui/label";
import { FormulaSetType, MathFunctionType } from "@/types/modelPrisma";
import { roleForPosition } from "@/components/admin/forceRoles";

/// Variables utilisables dans une expression, telles que substituées côté serveur.
const availableVariables: { name: string; meaning: string }[] = [
  { name: "j3", meaning: "jour complet" },
  { name: "m3", meaning: "mois complet" },
  { name: "a5", meaning: "année complète" },
  { name: "j1 j2", meaning: "chiffres du jour" },
  { name: "m1 m2", meaning: "chiffres du mois" },
  { name: "a1 … a4", meaning: "chiffres de l'année" },
];

export default function DataManipulationFunctions() {

  const [sets, setSets] = useState<FormulaSetType[]>([]);
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
  const [selectedFunction, setSelectedFunction] = useState<MathFunctionType | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [generatedNumbers, setGeneratedNumbers] = useState<
    { title: number; result: number | null; error?: string }[]
  >([]);
  /// Jeu réellement appliqué au dernier calcul du banc d'essai.
  const [testedSet, setTestedSet] = useState<FormulaSetType | null>(null);

  const selectedSet = sets.find((s) => s.id === selectedSetId) ?? null;
  const functions = selectedSet?.functions ?? [];

  useEffect(() => {
    const fetchSets = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/formulaSets");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Erreur lors du chargement");

        setSets(data.sets);
        // Le jeu par défaut est le point d'entrée naturel.
        setSelectedSetId(
          (data.sets as FormulaSetType[]).find(isDefaultSet)?.id ?? data.sets[0]?.id ?? null
        );
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Impossible de charger les formules");
      } finally {
        setLoading(false);
      }
    };
    fetchSets();
  }, []);

  /// Remplace un jeu dans la liste, en conservant l'ordre.
  const applyUpdatedSet = (updated: FormulaSetType) => {
    setSets((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const handleSave = async () => {
    if (!selectedFunction || !selectedSet) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/mathFunctions/${selectedFunction.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expression: selectedFunction.expression }),
      });
      const updated = await res.json();
      if (!res.ok) throw new Error(updated.error ?? "Erreur lors de l'enregistrement");

      applyUpdatedSet({
        ...selectedSet,
        functions: selectedSet.functions.map((f) => (f.id === updated.id ? updated : f)),
      });

      toast.success("Formule mise à jour !");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateNumbers = () => {
    if (!birthDate) {
      toast.error("Veuillez sélectionner une date de naissance");
      return;
    }

    // Le banc d'essai applique le jeu que le générateur choisirait pour cette
    // année-là, pas celui qu'on est en train d'éditer : c'est le seul moyen de
    // vérifier qu'une tranche prend bien le relais.
    const applicable = selectFormulaSet(sets, birthDate.getFullYear());
    setTestedSet(applicable);

    const variables = buildBirthVariables(birthDate);

    // Chaque formule est évaluée indépendamment : une expression fautive affiche
    // son message d'erreur sans empêcher le calcul des six autres.
    setGeneratedNumbers(
      applicable.functions.map((f) => {
        try {
          return { title: f.number, result: evaluateFormula(f.expression, variables) };
        } catch (err) {
          return {
            title: f.number,
            result: null,
            error: err instanceof Error ? err.message : "Formule invalide.",
          };
        }
      })
    );
  };

  // Dernier diagnostic connu par position : c'est ce qui rend une expression
  // fautive visible directement dans la liste.
  const errorsByNumber = new Map(
    generatedNumbers.filter((n) => n.error).map((n) => [n.title, n.error as string])
  );

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      {/* ── Les 7 expressions ── */}
      <section
        aria-labelledby="formulas-title"
        className="border-line bg-paper shadow-sheet rounded-xl border p-5 md:p-6"
      >
        <h2 id="formulas-title" className="eyebrow text-brand-deep">
          Les 7 formules
        </h2>
        <p className="text-ink-muted mt-2 text-sm">
          Sélectionnez une formule pour modifier son expression. La position
          détermine le rôle symbolique imprimé dans le miroir.
        </p>

        {/* ── Jeux de formules ──
            Chaque jeu couvre une tranche d'années de naissance ; le jeu par
            défaut s'applique partout ailleurs. */}
        <div className="border-line mt-5 rounded-lg border p-3">
          <p className="text-ink-muted text-[0.8125rem]">
            Les formules dépendent de l&apos;année de naissance. Choisissez le jeu à
            modifier.
          </p>

          <div role="group" aria-label="Jeu de formules" className="mt-3 flex flex-wrap gap-2">
            {sets.map((set) => (
              <button
                key={set.id}
                type="button"
                onClick={() => {
                  setSelectedSetId(set.id);
                  setSelectedFunction(null);
                }}
                aria-pressed={selectedSetId === set.id}
                className={`cursor-pointer rounded-md px-3 py-2 text-left text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] ${
                  selectedSetId === set.id
                    ? "bg-primary font-semibold text-white"
                    : "border-line text-ink-muted hover:bg-brand-veil border"
                }`}
              >
                {set.label}
                <span
                  className={`block text-[0.75rem] ${
                    selectedSetId === set.id ? "opacity-80" : "opacity-70"
                  }`}
                >
                  {describeRange(set)}
                </span>
              </button>
            ))}

          </div>

          {selectedSet && !isDefaultSet(selectedSet) && (
            <p className="border-line/70 text-ink-muted mt-3 border-t pt-3 text-[0.8125rem]">
              Ce jeu remplace entièrement le jeu par défaut pour les{" "}
              {describeRange(selectedSet)}.
            </p>
          )}
        </div>

        {loading ? (
          <div className="mt-5 space-y-2" aria-busy="true">
            <span className="sr-only">Chargement des formules…</span>
            {Array.from({ length: 7 }).map((_, index) => (
              <Skeleton key={index} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <ul className="mt-5 space-y-2">
            {functions.map((f) => {
              const isSelected = selectedFunction?.id === f.id;
              const error = errorsByNumber.get(f.number);

              return (
                <li
                  key={f.id}
                  className={`rounded-lg border transition-colors ${
                    isSelected
                      ? "border-brand bg-brand-veil"
                      : error
                        ? "border-destructive/40 bg-alert-wash"
                        : "border-line"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedFunction(isSelected ? null : f)}
                    aria-expanded={isSelected}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-lg p-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                        error
                          ? "bg-alert-wash text-destructive"
                          : "bg-brand-wash text-brand-deep"
                      }`}
                    >
                      {f.number}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="text-ink block text-sm font-medium">
                        {roleForPosition(f.number) || `Formule ${f.number}`}
                      </span>
                      <code className="text-ink-muted block truncate font-mono text-[0.8125rem]">
                        {f.expression}
                      </code>
                    </span>

                    {error && (
                      <span className="text-destructive flex shrink-0 items-center gap-1 text-xs font-semibold">
                        <TriangleAlert aria-hidden="true" className="h-4 w-4" />
                        Invalide
                      </span>
                    )}

                    <ChevronDown
                      aria-hidden="true"
                      className={`text-ink-muted h-4 w-4 shrink-0 transition-transform ${
                        isSelected ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isSelected && selectedFunction && (
                    <div className="border-line/70 space-y-3 border-t px-3 pt-4 pb-4">
                      <div>
                        <Label htmlFor="formula-expression" className="pb-2">
                          Expression de la formule {selectedFunction.number}
                        </Label>
                        <Input
                          id="formula-expression"
                          className="bg-paper font-mono"
                          spellCheck={false}
                          autoComplete="off"
                          aria-describedby={error ? "formula-error" : undefined}
                          aria-invalid={Boolean(error)}
                          value={selectedFunction.expression}
                          onChange={(e) =>
                            setSelectedFunction({
                              ...selectedFunction,
                              expression: e.target.value,
                            })
                          }
                        />
                      </div>

                      {error && (
                        <p
                          id="formula-error"
                          role="alert"
                          className="text-destructive text-sm"
                        >
                          {error}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-2">
                        <Button onClick={handleSave} disabled={saving}>
                          {saving ? (
                            <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save aria-hidden="true" className="h-4 w-4" />
                          )}
                          Enregistrer
                        </Button>
                        <span className="text-ink-muted text-[0.8125rem]">
                          Testez ensuite l&apos;expression dans le banc d&apos;essai.
                        </span>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        <details className="border-line mt-5 rounded-lg border">
          <summary className="text-ink cursor-pointer list-none px-4 py-3 text-sm font-medium select-none">
            Aide-mémoire : les variables disponibles
          </summary>

          <div className="border-line/70 border-t px-4 py-4">
            <ul className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
              {availableVariables.map((variable) => (
                <li key={variable.name} className="flex items-baseline gap-3 py-1">
                  <code className="text-primary shrink-0 font-mono text-sm">
                    {variable.name}
                  </code>
                  <span aria-hidden="true" className="leader-dots" />
                  <span className="text-ink-muted shrink-0 text-sm">
                    {variable.meaning}
                  </span>
                </li>
              ))}
            </ul>

            {/* La juxtaposition ne se devine pas : elle mérite son propre encart. */}
            <div className="bg-brand-veil mt-4 rounded-lg px-4 py-3">
              <p className="text-ink text-sm font-medium">Accoler deux variables</p>
              <p className="text-ink-muted mt-1 text-[0.8125rem]">
                Les variables d&apos;un seul chiffre peuvent s&apos;écrire à la suite
                pour former un nombre. Pour une naissance le 04/07/1993 :{" "}
                <code className="text-primary font-mono">a3a4</code> vaut 93 et{" "}
                <code className="text-primary font-mono">j2m1</code> vaut 40.
              </p>
              <p className="text-ink-muted mt-1.5 text-[0.8125rem]">
                Seules <code className="font-mono">j1 j2 m1 m2 a1 a2 a3 a4</code> le
                permettent. <code className="font-mono">j3</code>,{" "}
                <code className="font-mono">m3</code> et{" "}
                <code className="font-mono">a5</code> portent des valeurs complètes,
                dont la longueur change d&apos;une date à l&apos;autre : les accoler
                donnerait un résultat différent selon la personne.
              </p>
            </div>

            <Image
              src="/pictures/formule-tuto.png"
              alt="Schéma de composition d'une formule à partir d'une date de naissance"
              width={220}
              height={220}
              className="mt-4"
            />
          </div>
        </details>
      </section>

      {/* ── Banc d'essai ── */}
      <section
        aria-labelledby="testbench-title"
        className="border-line bg-paper shadow-sheet rounded-xl border p-5 lg:sticky lg:top-6 md:p-6"
      >
        <h2 id="testbench-title" className="eyebrow text-brand-deep">
          Banc d&apos;essai
        </h2>
        <p className="text-ink-muted mt-2 text-sm">
          Une date de naissance, et les 7 formules donnent les numéros des forces
          correspondantes. Rien n&apos;est enregistré.
        </p>
        <p className="text-ink-muted mt-2 text-[0.8125rem]">
          Le calcul applique le jeu correspondant à l&apos;année saisie, pas
          forcément celui affiché à gauche.
        </p>

        <div className="mt-5 space-y-3">
          <div>
            <Label htmlFor="testbench-date" className="pb-2">
              Date de naissance
            </Label>
            <Input
              id="testbench-date"
              type="date"
              className="bg-paper"
              onChange={(e) => setBirthDate(new Date(e.target.value))}
            />
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleGenerateNumbers}
          >
            <Calculator aria-hidden="true" className="h-4 w-4" />
            Calculer les 7 numéros
          </Button>
        </div>

        {testedSet && generatedNumbers.length > 0 && (
          <p className="bg-brand-veil text-brand-deep mt-4 rounded-lg px-3 py-2 text-[0.8125rem]">
            Jeu appliqué : <strong>{testedSet.label}</strong> ({describeRange(testedSet)})
          </p>
        )}

        {generatedNumbers.length > 0 && (
          <ol className="mt-5 space-y-1" aria-live="polite">
            {generatedNumbers.map((n) => (
              <li key={n.title} className="flex items-baseline gap-3 py-1.5">
                <span className="text-ink-muted font-display w-4 shrink-0 text-sm">
                  {n.title}
                </span>
                <span className="text-ink-muted min-w-0 truncate text-sm">
                  {roleForPosition(n.title)}
                </span>
                <span aria-hidden="true" className="leader-dots" />
                {n.error ? (
                  <span className="text-destructive shrink-0 text-sm font-semibold">
                    erreur
                  </span>
                ) : (
                  <span className="text-primary font-display shrink-0 text-lg">
                    {n.result}
                  </span>
                )}
              </li>
            ))}
          </ol>
        )}

        {generatedNumbers.some((n) => n.error) && (
          <div
            role="alert"
            className="bg-alert-wash border-destructive/30 mt-4 rounded-lg border p-3"
          >
            <p className="text-destructive flex items-center gap-2 text-sm font-semibold">
              <TriangleAlert aria-hidden="true" className="h-4 w-4" />
              Expressions à corriger
            </p>
            <ul className="text-destructive mt-2 space-y-1 text-[0.8125rem]">
              {generatedNumbers
                .filter((n) => n.error)
                .map((n) => (
                  <li key={n.title}>
                    Formule {n.title} : {n.error}
                  </li>
                ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
