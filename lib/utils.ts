import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateFR(dateString: string): string {
  if (!dateString) return "";

  const [year, month, day] = dateString.split("-");
  if (!year || !month || !day) return dateString;

  return `${day}/${month}/${year}`;
}

export function simplifyNameForDesign(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return fullName; // prénom seul

  const firstName = parts[0]; // on ne garde que le premier mot comme prénom
  let lastName = parts[parts.length - 1]; // dernier mot = nom de famille

  // Si le nom contient un tiret, ne garder que la première partie
  if (lastName.includes("-")) {
    lastName = lastName.split("-")[0];
  }

  return ` ${firstName} ${lastName}`;
}

export function countCharacters(text: string, ignoreSpaces: boolean = false): number {
  if (ignoreSpaces) {
    return text.replace(/\s+/g, "").length; // enlève les espaces
  }
  return text.length;
}