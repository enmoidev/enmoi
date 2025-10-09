"use client";

import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { toast } from "react-hot-toast";
import { Loader2, Save} from "lucide-react";
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
      
      catch (err) {
        toast.error("Impossible de récupérer les settings");
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
    } catch (err) {
      toast.error("Erreur lors de la mise à jour des paramètres globaux");
    } finally {
      setSavingSettings(false);
    }
  };

  return (

    <Card className="w-full space-y-6">

      <CardHeader>
        <CardTitle className="text-2xl text-neutral-700">Paramètres globaux</CardTitle>
        <p className="text-neutral-700">Modifier les paramètres généraux de l'application et le mot de passe administrateur</p>
      </CardHeader>

      <CardContent className="space-y-6">

        {loading ? (
          <Loader2 className="animate-spin mx-auto w-6 h-6 text-primary" />
        ) : (
          <>
            {/* --- Global Settings --- */}
            <div className="flex flex-col gap-2 justify-center">
              <Label className="pb-2">Nombre d'ambassadeurs</Label>
              <Input
                className="md:w-1/3 w-full"
                type="number"
                value={ambassadorAccounts ?? ""}
                onChange={(e) => setAmbassadorAccounts(Number(e.target.value))}
                placeholder="définir le nombre de compte ambassadeur disponible ici"
              />
              <Button
              size={"lg"}
                onClick={handleSaveSettings}
                disabled={savingSettings}
                className="mt-2 flex items-center gap-2 w-auto self-center"
              >
                {savingSettings ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4" /> <span className="pb-1">Enregistrer les modifications</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> <span className="pb-1">Enregistrer les modifications</span>
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
