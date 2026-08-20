// Logotype enMOI — image de marque fournie par le client
//
// Deux variantes du même fichier : la version turquoise pour les fonds clairs,
// la version blanche pour le bandeau turquoise (où le turquoise serait invisible).

import Image from "next/image";

type Tone = "brand" | "white";

type Props = {
  /// Adapte la variante au fond sur lequel le logo est posé.
  tone?: Tone;
  /// Hauteur de rendu ; la largeur suit le ratio ~2,75 du fichier.
  height?: number;
  className?: string;
  priority?: boolean;
};

const SOURCE: Record<Tone, string> = {
  brand: "/logo/logo-enmoi.png",
  white: "/logo/logo-enmoi-blanc.png",
};

// Ratio natif du fichier source (829 × 301).
const ASPECT_RATIO = 829 / 301;

export function BrandLogo({ tone = "brand", height = 44, className, priority = false }: Props) {
  return (
    <Image
      src={SOURCE[tone]}
      alt="enMOI"
      height={height}
      width={Math.round(height * ASPECT_RATIO)}
      priority={priority}
      className={className}
      style={{ height, width: "auto" }}
    />
  );
}
