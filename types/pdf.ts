export type PdfAptitude = {
  id: string;
  number: number;
  title: string;
  symbolicRole: string;
  livingDefinition: string;
  emblematicText: string;
  associatedStrengths: string[];
  vigilanceZones: string[];
  keywords: string[];
};

export type PdfData = {
  firstName: string;
  lastName: string;
  birthPlace: string;
  birthDate: string; // ISO string
  aptitudes: PdfAptitude[];
};