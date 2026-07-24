// Directives d'indexation
// Aucun contenu public n'est encore publié : on bloque tout jusqu'à la mise en
// ligne du site vitrine. À rouvrir à ce moment-là (et ajouter un sitemap).

import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        disallow: "/",
      },
    ],
  };
}
