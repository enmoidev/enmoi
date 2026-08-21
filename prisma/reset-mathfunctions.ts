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
import { DEFAULT_FORMULA_SET_ID } from "../lib/computeFunctions/formulaSets";

const prisma = new PrismaClient();

async function main() {
  // N'agit que sur le jeu par défaut : un jeu de tranche (2000-2009…) contient
  // des expressions propres au client, qu'un placeholder n'a rien à écraser.
  await prisma.formulaSet.upsert({
    where: { id: DEFAULT_FORMULA_SET_ID },
    update: {},
    create: { id: DEFAULT_FORMULA_SET_ID, label: "Défaut", yearFrom: null, yearTo: null },
  });

  const existing = await prisma.mathFunction.findMany({
    where: { setId: DEFAULT_FORMULA_SET_ID },
    orderBy: { number: "asc" },
  });

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
      where: { setId_number: { setId: DEFAULT_FORMULA_SET_ID, number } },
      update: { expression },
      create: { setId: DEFAULT_FORMULA_SET_ID, number, expression },
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
