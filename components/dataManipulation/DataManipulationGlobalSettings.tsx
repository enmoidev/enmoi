"use client";

// Paramètres globaux — réglages qui s'appliquent à toute l'application

import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { toast } from "react-hot-toast";
import { Loader2, Save } from "lucide-react";
import { Label } from "../ui/label";

export default function DataManipulationGlobalSettings() {

  const [loading, setLoading] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [ambassadorAccounts, setAmbassadorAccounts] = useState<number | null>(null);

  useEffect(() => {

    const fetchSettings = async () => {

      setLoading(true);

      try {
        const res = await fetch("/api/settings");
        if (!res.ok) throw new Error("Erreur lors du chargement des settings");
        const data = await res.json();
        setAmbassadorAccounts(data.ambassadorAccounts);
      }

      catch {
        toast.error("Impossible de récupérer les paramètres globaux");
      }

      finally {
        setLoading(false);
      }

    };
    fetchSettings();

  }, []);

  // --- Sauvegarde des paramètres globaux ---
  const handleSaveSettings = async () => {
    if (ambassadorAccounts === null) return;
    setSavingSettings(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "globalSettings", ambassadorAccounts }),
      });
      if (!res.ok) throw new Error();
      toast.success("Paramètres globaux mis à jour !");
    } catch {
      toast.error("Erreur lors de la mise à jour des paramètres globaux");
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <section
      aria-labelledby="settings-title"
      className="border-line bg-paper shadow-sheet max-w-2xl rounded-xl border p-5 md:p-6"
    >
      <h2 id="settings-title" className="eyebrow text-brand-deep">
        Comptes ambassadeur
      </h2>
      <p className="text-ink-muted mt-2 text-sm">
        Nombre de comptes ambassadeur ouverts sur l&apos;application. Le réglage
        s&apos;applique immédiatement à toute la plateforme.
      </p>

      {loading ? (
        <div className="mt-5 space-y-3" aria-busy="true">
          <span className="sr-only">Chargement des paramètres…</span>
          <Skeleton className="h-5 w-48 rounded" />
          <Skeleton className="h-9 w-full max-w-xs rounded-md" />
        </div>
      ) : (
        <div className="mt-5">
          <Label htmlFor="ambassador-accounts" className="pb-2">
            Nombre de comptes ambassadeur
          </Label>
          <Input
            id="ambassador-accounts"
            className="bg-paper w-full max-w-xs"
            type="number"
            aria-describedby="ambassador-accounts-hint"
            value={ambassadorAccounts ?? ""}
            onChange={(e) => setAmbassadorAccounts(Number(e.target.value))}
            placeholder="0"
          />
          <p id="ambassador-accounts-hint" className="text-ink-muted mt-1.5 text-[0.8125rem]">
            Laissez à 0 pour fermer les inscriptions ambassadeur.
          </p>

          <div className="border-line mt-6 border-t pt-5">
            <Button onClick={handleSaveSettings} disabled={savingSettings}>
              {savingSettings ? (
                <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
              ) : (
                <Save aria-hidden="true" className="h-4 w-4" />
              )}
              Enregistrer
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
