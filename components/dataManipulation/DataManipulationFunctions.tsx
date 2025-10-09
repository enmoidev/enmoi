"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Textarea } from "../ui/textarea";
import { toast } from "react-hot-toast";
import { Calculator, Loader2, Save } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { evaluateFormula } from "@/lib/computeFunctions/computeFunctions";
import { Label } from "../ui/label";
import { MathFunctionType } from "@/types/modelPrisma";

export default function DataManipulationFunctions() {

  const [functions, setFunctions] = useState<MathFunctionType[]>([]);
  const [selectedFunction, setSelectedFunction] = useState<MathFunctionType | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [generatedNumbers, setGeneratedNumbers] = useState<{ title: number; result: number | null }[]>([]);

  useEffect(() => {

    const fetchFunctions = async () => {

      setLoading(true);

      try {
        const res = await fetch("/api/mathFunctions");

        if (!res.ok) throw new Error("Erreur lors du chargement");

        const data = await res.json();

        setFunctions(data);
      } 
      
      catch (error) {
        toast.error("Impossible de charger les formules");
      } 
      
      finally {
        setLoading(false);
      }
    };
    fetchFunctions();
  }, []);

  const handleSave = async () => {

    if (!selectedFunction) return;

    setSaving(true);

    try {
      const res = await fetch(`/api/mathFunctions/${selectedFunction.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedFunction),
      });

      if (!res.ok) throw new Error();

      const updated = await res.json();

      setFunctions((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));

      toast.success("Formule mise à jour !");

    } 
    
    catch {
      toast.error("Erreur lors de l'enregistrement");
    } 
    
    finally {
      setSaving(false);
    }
  };

  const handleGenerateNumbers = () => {

    if (!birthDate){
      toast.error("Veuillez sélectionner une date de naissance");
      return;
    } 

    const day = birthDate.getDate();
    const month = birthDate.getMonth() + 1;
    const year = birthDate.getFullYear();

    const yearDigits = year.toString().padStart(4, "0").split("").map(Number);
    const dayDigits = day.toString().padStart(2, "0").split("").map(Number);
    const monthDigits = month.toString().padStart(2, "0").split("").map(Number);

    const results = functions.map((f) => ({
      title: f.number,
      result: evaluateFormula(
        f.expression,
        day,
        month,
        year,
        yearDigits[0],
        yearDigits[1],
        yearDigits[2],
        yearDigits[3],
        dayDigits[0],
        dayDigits[1],
        monthDigits[0],
        monthDigits[1]
      ),
    }));

    setGeneratedNumbers(results);
  };

  return (
    
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl text-neutral-700">Gestion des formules mathématiques</CardTitle>
        <p className="text-neutral-700">sélectionner une formule, la modifier et enregistrer les modifications. Générer les 7 nombres à partir d'une date de naissance.</p>
      </CardHeader>

      <Image
          src="/pictures/formule-tuto.png"
          alt="Bannière des formules"
          width={220}
          height={220}
          className="mb-4 self-center"
        />

        <hr className="my-6 border-t border-muted" />

      <CardContent className="space-y-8">
        
        {/* Étape 1 : Sélection */}
        <section className="flex flex-col">
          <h2 className="text-lg font-semibold mb-2 text-primary italic">Étape 1 : Sélectionner une formule</h2>
          {loading ? (
            <Loader2 className="animate-spin text-primary mx-auto" />
          ) : (
            <Select
              onValueChange={(val) => {
                const f = functions.find((f) => f.id === val) || null;
                setSelectedFunction(f);
              }}
              value={selectedFunction?.id || ""}
            >
              <SelectTrigger  className="w-full text-lg self-center text-primary/80 font-bold">
                <SelectValue placeholder="Sélectionnez une formule..." />
              </SelectTrigger>
              <SelectContent>
                {functions.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    #{f.number} - {f.expression}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </section>

        <hr className="my-6 border-t border-muted" />

        {/* Étape 2 : Modifier */}
        {selectedFunction && (
          <section>
            <h2 className="text-lg font-semibold mb-2 text-primary italic">
              Étape 2 : Modifier la formule #{selectedFunction.number}
            </h2>
            <Label className="pb-2">Expression de la formule mathématique</Label>
            <Input
              className="md:w-1/3 w-full"
              value={selectedFunction.expression}
              onChange={(e) =>
                setSelectedFunction({ ...selectedFunction, expression: e.target.value })
              }
            />
          </section>
        )}

        <hr className="my-6 border-t border-muted" />

        {/* Étape 3 : Enregistrer */}
        {selectedFunction && (
          <section className="w-full flex flex-col">
            <h2 className="text-lg font-semibold mb-2 text-primary italic">Étape 3 : Enregistrer les modifications pour la formule #{selectedFunction.number}</h2>
            <Button size={"lg"}  onClick={handleSave} disabled={saving} className="self-center">
              {saving ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4" />
                </>
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span className="pb-1">Enregistrer les modifications</span>
            </Button>
          </section>
        )}

        <hr className="my-6 border-t border-muted" />

        {/* Étape 4 : Générer les nombres */}
        {selectedFunction && (
          <section>
            <h2 className="text-lg font-semibold mb-2 text-primary italic">Étape 4 : Générer les 7 nombres</h2>
            <Label className="pb-2">Sélection d'une date de naissance</Label>
            <div className="flex flex-col gap-2">
              <Input
                type="date"
                className="md:w-1/3 w-full"
                onChange={(e) => setBirthDate(new Date(e.target.value))}
              />
              <Button variant="outline" className="mt-2 w-auto self-center flex items-center gap-2" size={"lg"} onClick={handleGenerateNumbers}>
                <Calculator className="w-4 h-4" />
                <span className="pb-1">Générer les 7 nombres correspondant aux 7 aptitudes</span>
              </Button>
            </div>

            {generatedNumbers.length > 0 && (
              <div className="mt-4 space-y-2 flex flex-row gap-10 items-center justify-center">
                {generatedNumbers.map((n, i) => (
                  <div key={i} className="text-lg">
                    <strong>Formule {n.title} :</strong> <span className="text-primary font-bold">{n.result}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </CardContent>
    </Card>
  );
}
