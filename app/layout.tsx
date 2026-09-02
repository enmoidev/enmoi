// Layout racine de l'application enMOI

import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "react-hot-toast";

// Charte typographique de la marque (mail client de juillet 2026), auto-hébergée :
// ce sont exactement les polices du livrable imprimé, ce qui aligne l'interface et
// le document. Aucune requête externe, la CSP de next.config.ts n'autorise aucune
// origine tierce.

// Cabin : la police de texte courant (corps de l'interface).
const cabin = localFont({
  src: [
    { path: "../public/fonts/Cabin-Regular.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/Cabin-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-sans-enmoi",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

// Georgia : le sérif des titres et intitulés, repris du livrable.
const georgia = localFont({
  src: [
    { path: "../public/fonts/georgia.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/georgiab.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-display-enmoi",
  display: "swap",
  fallback: ["Georgia", "serif"],
});

// Gabriola : la script manuscrite du prénom sur le livrable. Réservée aux touches
// décoratives dans l'interface.
const gabriola = localFont({
  src: [{ path: "../public/fonts/Gabriola.ttf", weight: "400", style: "normal" }],
  variable: "--font-script-enmoi",
  display: "swap",
  fallback: ["Georgia", "serif"],
});

export const metadata: Metadata = {
  title: {
    default: "enMOI — Révèle tes forces mentales innées",
    template: "%s | enMOI",
  },
  description:
    "enMOI accompagne le développement personnel à partir de l'inné et de l'acquis, et révèle les 7 forces mentales dans un Miroir enMOI personnel.",
  applicationName: "enMOI",
  authors: [{ name: "enMOI" }],
  // Aucun contenu public n'est encore publié : on n'indexe rien tant que le site
  // vitrine n'est pas en ligne. À rouvrir le jour où la vitrine arrive.
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      className={`${cabin.variable} ${georgia.variable} ${gabriola.variable}`}
    >
      <body className="min-h-screen bg-background antialiased">
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: "0.5rem",
              background: "var(--enmoi-ink)",
              color: "#ffffff",
              fontSize: "0.875rem",
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
