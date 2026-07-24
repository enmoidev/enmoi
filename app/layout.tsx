// Layout racine de l'application EnMoi

import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "react-hot-toast";

// Les trois polices de la marque, auto-hébergées : ce sont exactement celles du
// PMI imprimé, ce qui aligne l'interface et le livrable. Aucune requête externe,
// la CSP de next.config.ts n'autorise aucune origine tierce.
const aktivGrotesk = localFont({
  src: [
    { path: "../public/fonts/AktivGrotesk-Regular.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/AktivGrotesk-Italic.ttf", weight: "400", style: "italic" },
    { path: "../public/fonts/AktivGrotesk-Medium.ttf", weight: "500", style: "normal" },
    { path: "../public/fonts/AktivGrotesk-MediumItalic.ttf", weight: "500", style: "italic" },
    { path: "../public/fonts/AktivGrotesk-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../public/fonts/AktivGrotesk-XBold.ttf", weight: "700", style: "normal" },
    { path: "../public/fonts/AktivGrotesk-XBoldItalic.ttf", weight: "700", style: "italic" },
  ],
  variable: "--font-sans-enmoi",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

// Philosopher : le sérif des intitulés institutionnels du PMI. Réservé aux
// capitales espacées et aux titres de page.
const philosopher = localFont({
  src: [{ path: "../public/fonts/Philosopher-Bold.ttf", weight: "700", style: "normal" }],
  variable: "--font-display-enmoi",
  display: "swap",
  fallback: ["Georgia", "serif"],
});

// Rosalia : la script du logotype. Utilisée nulle part ailleurs.
const rosalia = localFont({
  src: [{ path: "../public/fonts/Rosalia.otf", weight: "400", style: "normal" }],
  variable: "--font-script-enmoi",
  display: "swap",
  fallback: ["Georgia", "serif"],
});

export const metadata: Metadata = {
  title: {
    default: "EnMoi — Découvre ton potentiel mental inné",
    template: "%s | EnMoi",
  },
  description:
    "EnMoi accompagne le développement personnel à partir de l'inné et de l'acquis, et révèle les 7 forces mentales à travers le PMI (Potentiel Mental Inné).",
  applicationName: "EnMoi",
  authors: [{ name: "EnMoi" }],
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
      className={`${aktivGrotesk.variable} ${philosopher.variable} ${rosalia.variable}`}
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
