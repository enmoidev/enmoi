// Réécriture des 7 formules avec les placeholders techniques
//
//   npx tsx prisma/reset-mathfunctions.ts
//
// ⚠️ DESTRUCTIF — contrairement à seed-mathfunctions.ts, ce script **écrase** les
// expressions existantes. Il ne doit jamais être lancé une fois que le client a
// saisi ses vraies formules depuis /admin/formules : leur contenu serait perdu.
//
// Il n'existe que pour remettre l'environnement de développement dans un état
// exploitable, les expressions historiques produisant des résultats hors de
// l'intervalle 0-99 et bloquant donc toute génération de livrable.

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PLACEHOLDER_EXPRESSIONS } from "./mathFunctionPlaceholders";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.mathFunction.findMany({ orderBy: { number: "asc" } });

  console.log("Expressions actuellement en base :");
  if (existing.length === 0) {
    console.log("  (aucune)");
  } else {
    existing.forEach((f) => console.log(`  ${f.number}. ${f.expression}`));
  }

  console.log("\nRemplacement par les placeholders bornés à 0-99 :");

  for (const [index, expression] of PLACEHOLDER_EXPRESSIONS.entries()) {
    const number = index + 1;
    await prisma.mathFunction.upsert({
      where: { number },
      update: { expression },
      create: { number, expression },
    });
    console.log(`  ${number}. ${expression}`);
  }

  console.log("\n⚠️ Ces expressions sont des placeholders techniques : les forces");
  console.log("   qu'elles désignent n'ont aucune signification métier.");
}

main()
  .catch((err) => {
    console.error("Échec de la réécriture des formules :", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
