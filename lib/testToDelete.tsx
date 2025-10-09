"use client";
import { useState } from "react";

export default function Home() {
  const [formData, setFormData] = useState({
    skillTitle: "",
    lastName: "",
    firstName: "",
    birthDate: "",
    birthPlace: "",
    symbolicRole: "",
    definition: "",
    emblematicText: "",
    strengths: [""],
    vigilanceZones: [""],
    keywords: ["", "", ""],
  });

  const handleArrayChange = (
    field: "strengths" | "vigilanceZones" | "keywords",
    index: number,
    value: string
  ) => {
    const updated = [...formData[field]];
    updated[index] = value;
    setFormData({ ...formData, [field]: updated });
  };

  const addArrayItem = (field: "strengths" | "vigilanceZones") => {
    setFormData({ ...formData, [field]: [...formData[field], ""] });
  };

  const handleGeneratePdf = async () => {
    const res = await fetch("/api/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    window.open(url); // ouvre le PDF dans un nouvel onglet
  };

  return (
    <div className="p-8 flex flex-col gap-4 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold">Formulaire PDF</h1>

      <input
        type="text"
        placeholder="Titre de l'aptitude"
        value={formData.skillTitle}
        onChange={(e) =>
          setFormData({ ...formData, skillTitle: e.target.value })
        }
        className="border p-2 rounded"
      />

      <input
        type="text"
        placeholder="Nom"
        value={formData.lastName}
        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
        className="border p-2 rounded"
      />

      <input
        type="text"
        placeholder="Prénom"
        value={formData.firstName}
        onChange={(e) =>
          setFormData({ ...formData, firstName: e.target.value })
        }
        className="border p-2 rounded"
      />

      <input
        type="date"
        placeholder="Date de naissance"
        value={formData.birthDate}
        onChange={(e) =>
          setFormData({ ...formData, birthDate: e.target.value })
        }
        className="border p-2 rounded"
      />

      <input
        type="text"
        placeholder="Lieu de naissance"
        value={formData.birthPlace}
        onChange={(e) =>
          setFormData({ ...formData, birthPlace: e.target.value })
        }
        className="border p-2 rounded"
      />

      <input
        type="text"
        placeholder="Rôle symbolique"
        value={formData.symbolicRole}
        onChange={(e) =>
          setFormData({ ...formData, symbolicRole: e.target.value })
        }
        className="border p-2 rounded"
      />

      <textarea
        placeholder="Définition vivante"
        value={formData.definition}
        onChange={(e) =>
          setFormData({ ...formData, definition: e.target.value })
        }
        className="border p-2 rounded h-24"
      />

      <textarea
        placeholder="Texte emblématique"
        value={formData.emblematicText}
        onChange={(e) =>
          setFormData({ ...formData, emblematicText: e.target.value })
        }
        className="border p-2 rounded h-24"
      />

      {/* Forces associées */}
      <div className="flex flex-col gap-2">
        <h2 className="font-semibold">Forces associées</h2>
        {formData.strengths.map((force, i) => (
          <input
            key={i}
            type="text"
            placeholder={`Force ${i + 1}`}
            value={force}
            onChange={(e) => handleArrayChange("strengths", i, e.target.value)}
            className="border p-2 rounded"
          />
        ))}
        <button
          type="button"
          onClick={() => addArrayItem("strengths")}
          className="bg-gray-200 p-1 rounded"
        >
          + Ajouter une force
        </button>
      </div>

      {/* Zones de vigilance */}
      <div className="flex flex-col gap-2">
        <h2 className="font-semibold">Zones de vigilance</h2>
        {formData.vigilanceZones.map((zone, i) => (
          <input
            key={i}
            type="text"
            placeholder={`Zone ${i + 1}`}
            value={zone}
            onChange={(e) => handleArrayChange("vigilanceZones", i, e.target.value)}
            className="border p-2 rounded"
          />
        ))}
        <button
          type="button"
          onClick={() => addArrayItem("vigilanceZones")}
          className="bg-gray-200 p-1 rounded"
        >
          + Ajouter une zone
        </button>
      </div>

      {/* Mots-clés */}
      <div className="flex flex-col gap-2">
        <h2 className="font-semibold">Mots-clés</h2>
        {formData.keywords.map((mot, i) => (
          <input
            key={i}
            type="text"
            placeholder={`Mot-clé ${i + 1}`}
            value={mot}
            onChange={(e) => handleArrayChange("keywords", i, e.target.value)}
            className="border p-2 rounded"
          />
        ))}
      </div>

      <button
        onClick={handleGeneratePdf}
        className="bg-blue-500 text-white p-2 rounded mt-4"
      >
        Générer le PDF
      </button>
    </div>
  );
}
