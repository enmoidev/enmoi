"use client";

import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Textarea } from "../ui/textarea";
import { toast } from "react-hot-toast";
import { Loader2, FileDown, Save, Plus, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
import { AptitudeType } from "@/types/modelPrisma";
import { PdfAptitude } from "@/types/pdf";

export default function DataManipulationAptitudes() {
  const [aptitudes, setAptitudes] = useState<AptitudeType[]>([]);
  const [selectedAptitude, setSelectedAptitude] = useState<AptitudeType | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [symbolicRole, setSymbolicRole] = useState<string>("Ta colonne vertébrale");

  useEffect(() => {

    const fetchAptitudes = async () => {

      setLoading(true);

      try {
        const res = await fetch("/api/aptitudes");
        if (!res.ok) throw new Error("Erreur lors du chargement");
        const data = await res.json();
        setAptitudes(data);
      } 
      
      catch {
        toast.error("Impossible de charger les aptitudes");
      } 
      
      finally {
        setLoading(false);
      }

    };

    fetchAptitudes();

  }, []);

  const handleSave = async () => {

    if (!selectedAptitude){
      toast.error("Veuillez sélectionner une aptitude");
      return;

    } 

    setSaving(true);

    try {
      const res = await fetch(`/api/aptitudes/${selectedAptitude.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedAptitude),
      });

      if (!res.ok) throw new Error();

      const updated = await res.json();

      setAptitudes((prev) =>prev.map((a) => (a.id === updated.id ? updated : a)));

      toast.success("Aptitude mise à jour !");

    } 
    
    catch {
      toast.error("Erreur lors de l'enregistrement des modifications de l'aptitude");
    } 
    
    finally {
      setSaving(false);
    }
  };

const handleGeneratePDF = async () => {

  if (!selectedAptitude) return;

  const aptitudeToSend:PdfAptitude = { ...selectedAptitude, symbolicRole };

  try {
    const res = await fetch("/api/pdf/aptitudeCard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(aptitudeToSend),
    });

    if (!res.ok) throw new Error("Erreur lors de la génération du PDF");

    // get PDF blob
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    // create temporary link to download
    const a = document.createElement("a");
    a.href = url;
    a.download = `Aptitude_${selectedAptitude.number}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    toast.success(`PDF généré pour l'aptitude ${selectedAptitude.number}`);
  } 
  
  catch (err) {
    console.error(err);
    toast.error("Impossible de générer le PDF");
  }

};

  const handleArrayChange = (field: keyof Pick<AptitudeType, "associatedStrengths" | "vigilanceZones" | "keywords">,index: number,value: string) => {

    if (!selectedAptitude) return;
    const updated = [...selectedAptitude[field]];
    updated[index] = value;
    setSelectedAptitude({ ...selectedAptitude, [field]: updated });

  };

  const handleAddItem = (field: keyof Pick<AptitudeType, "associatedStrengths" | "vigilanceZones">) => {

    if (!selectedAptitude) return;
    setSelectedAptitude({...selectedAptitude,[field]: [...selectedAptitude[field], ""],});

  };

  const handleRemoveItem = (field: keyof Pick<AptitudeType, "associatedStrengths" | "vigilanceZones">,index: number) => {

    if (!selectedAptitude) return;
    const updated = selectedAptitude[field].filter((_, i) => i !== index);
    setSelectedAptitude({ ...selectedAptitude, [field]: updated });

  };

  return (

    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl text-neutral-700">Gestion des aptitudes</CardTitle>
        <p className="text-neutral-700">sélectionner une aptitude, la modifier, générer la fiche correspondante, puis valider et enregistrer les modifications.</p>
      </CardHeader>

      <hr className="my-6 border-t border-muted" />

      <CardContent className="space-y-8">
        {/* Étape 1 */}
        <section className="flex flex-col">
          <h2 className="text-lg font-semibold mb-2 text-primary italic">Étape 1 : Choisir une aptitude</h2>
          {loading ? (
            <Loader2 className="animate-spin text-primary mx-auto" />
          ) : (
            <Select

              onValueChange={(val) => {
                const selected = aptitudes.find((a) => a.id === val) || null;
                setSelectedAptitude(selected);
              }}
              value={selectedAptitude?.id || ""}
            >
              <SelectTrigger className="w-full text-lg self-center text-primary/80 font-bold">
                <SelectValue placeholder="Sélectionnez une aptitude..." />
              </SelectTrigger>
              <SelectContent>
                {aptitudes.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    #{a.number} - {a.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </section>

        <hr className="my-6 border-t border-muted" />

        {/* Étape 2 */}
        {selectedAptitude && (
          <section>
            <h2 className="text-lg font-semibold mb-2 text-primary italic">
              Étape 2 : Modifier l&apos;aptitude #{selectedAptitude.number}
            </h2>

            <div className="space-y-6 border rounded-lg p-4">
              <div>
                <Label className="pb-2">Titre</Label>
                <Input
                  value={selectedAptitude.title}
                  className="md:w-1/3 w-full"
                  onChange={(e) =>
                    setSelectedAptitude({
                      ...selectedAptitude,
                      title: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label className="pb-2">Définition vivante</Label>
                <Textarea
                  rows={3}
                  value={selectedAptitude.livingDefinition}
                  onChange={(e) =>
                    setSelectedAptitude({
                      ...selectedAptitude,
                      livingDefinition: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label className="pb-2">Texte emblématique</Label>
                <Textarea
                  rows={7}
                  value={selectedAptitude.emblematicText}
                  onChange={(e) =>
                    setSelectedAptitude({
                      ...selectedAptitude,
                      emblematicText: e.target.value,
                    })
                  }
                />
              </div>

              {/* Forces associées */}
              <div>
                <div className="flex gap-2 items-center">
                  <Label>Forces associées</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddItem("associatedStrengths")}
                  >
                    <Plus className="w-4 h-4" /> <span className="pb-1">Ajouter une force associée</span>
                  </Button>
                </div>
                <div className="space-y-2 mt-2">
                  {selectedAptitude.associatedStrengths.map((s, i) => (
                    <div key={i} className="flex gap-2">
                      <Input
                        value={s}
                        onChange={(e) =>
                          handleArrayChange("associatedStrengths", i, e.target.value)
                        }
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() =>
                          handleRemoveItem("associatedStrengths", i)
                        }
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Zones de vigilance */}
              <div>
                <div className="flex items-center gap-2">
                  <Label>Zones de vigilance</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddItem("vigilanceZones")}
                  >
                    <Plus className="w-4 h-4" /> <span className="pb-1">Ajouter une zone de vigilance</span>
                  </Button>
                </div>
                <div className="space-y-2 mt-2">
                  {selectedAptitude.vigilanceZones.map((z, i) => (
                    <div key={i} className="flex gap-2">
                      <Input
                        value={z}
                        onChange={(e) =>
                          handleArrayChange("vigilanceZones", i, e.target.value)
                        }
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleRemoveItem("vigilanceZones", i)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mots-clés (3 fixes) */}
              <div>
                <Label className="pb-2">Mots-clés</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {selectedAptitude.keywords.map((keyword, index) => (
                    <Input
                      key={index}
                      value={keyword}
                      onChange={(e) =>
                        handleArrayChange("keywords", index, e.target.value)
                      }
                      placeholder={`Mot-clé ${index + 1}`}
                      className="focus:ring-2 focus:ring-primary focus-visible:ring-offset-0 transition-all"
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        <hr className="my-6 border-t border-muted" />

        {/* Étape 3 */}
        {selectedAptitude && (
          <section className="flex flex-col">
            <h2 className="text-lg font-semibold mb-2 text-primary italic">
              Étape 3 : Générer la fiche et vérifier les informations de l&apos;aptitude #{selectedAptitude.number}
            </h2>

            <Label className="pb-2">Définir le rôle symbolique</Label>
            <Select
              value={symbolicRole}
              onValueChange={(val) => setSymbolicRole(val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionnez un rôle symbolique..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ta colonne vertébrale">Ta colonne vertébrale</SelectItem>
                <SelectItem value="Ta boussole">Ta boussole</SelectItem>
                <SelectItem value="Ta destination">Ta destination</SelectItem>
                <SelectItem value="Ton moteur">Ton moteur</SelectItem>
                <SelectItem value="Ta vitrine">Ta vitrine</SelectItem>
                <SelectItem value="Ton énergie générationnelle">Ton énergie générationnelle</SelectItem>
                <SelectItem value="Ton inspiratrice">Ton inspiratrice</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size={"lg"}
              onClick={handleGeneratePDF}
              className="mt-2 w-auto self-center flex items-center gap-2"
            >
              <FileDown className="w-4 h-4" /> <span className="pb-1">Générer le PDF de la fiche de l&apos;aptitude</span>
            </Button>
          </section>
        )}

        <hr className="my-6 border-t border-muted" />

        {/* Étape 4 */}
        {selectedAptitude && (
          <section className="flex flex-col">
            <h2 className="text-lg font-semibold mb-2 text-primary italic">
              Étape 4 : Enregistrer les modifications de l&apos;aptitude #{selectedAptitude.number}
            </h2>
            <Button
              onClick={handleSave}
              size={"lg"}
              disabled={saving}
              className="mt-2 w-auto self-center flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4" /> <span className="pb-1">Enregistrer les modifications</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> <span className="pb-1">Enregistrer les modifications</span>
                </>
              )}
            </Button>
          </section>
        )}
      </CardContent>
    </Card>
  );
}
