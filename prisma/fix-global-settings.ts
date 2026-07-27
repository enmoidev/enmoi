// Consolide les paramètres globaux en une seule ligne d'identifiant « global »
//
//   npx tsx prisma/fix-global-settings.ts
//
// À lancer une seule fois si la base contient plusieurs lignes GlobalSettings
// (héritage de l'ancienne route qui pouvait en créer plusieurs). La valeur
// conservée est celle de la ligne la plus récemment modifiée.

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const SETTINGS_ID = "global";

async function main() {
  const rows = await prisma.globalSettings.findMany({ orderBy: { updatedAt: "desc" } });

  console.log(`${rows.length} ligne(s) trouvée(s) :`);
  rows.forEach((r) => console.log(`  id=${r.id}  ambassadorAccounts=${r.ambassadorAccounts}`));

  if (rows.length <= 1 && rows[0]?.id === SETTINGS_ID) {
    console.log("Déjà consolidé, rien à faire.");
    return;
  }

  // Valeur de référence = ligne la plus récente.
  const kept = rows[0]?.ambassadorAccounts ?? 0;

  // Écrit la ligne unique « global » avec cette valeur.
  await prisma.globalSettings.upsert({
    where: { id: SETTINGS_ID },
    update: { ambassadorAccounts: kept },
    create: { id: SETTINGS_ID, ambassadorAccounts: kept },
  });

  // Supprime toutes les autres.
  const { count } = await prisma.globalSettings.deleteMany({
    where: { id: { not: SETTINGS_ID } },
  });

  console.log(`\nConsolidé : 1 ligne « ${SETTINGS_ID} » (ambassadorAccounts=${kept}), ${count} ligne(s) supprimée(s).`);
}

main()
  .catch((err) => {
    console.error("Échec de la consolidation :", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
