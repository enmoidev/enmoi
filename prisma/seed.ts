// Seed du ou des comptes administrateurs
//
//   Dev  : npx tsx prisma/seed.ts
//   Prod : npx dotenv -e .env.production -- npx tsx prisma/seed.ts
//
// Ce script utilise l'API serveur de better-auth (auth.api.signUpEmail) et non le
// client HTTP : il fonctionne sans serveur Next démarré. Le chargement explicite
// de dotenv en tête de fichier est nécessaire, les modules importés lisant
// process.env dès leur évaluation.

import "dotenv/config";

import { PrismaClient, Role } from "@prisma/client";
import { auth } from "../lib/auth";

const prisma = new PrismaClient();

/// Découpe une variable d'environnement multi-valeurs ("a,b" -> ["a", "b"]).
function splitEnv(value: string): string[] {
  return value.split(",").map((entry) => entry.trim());
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`${name} n'est pas défini dans le fichier d'environnement.`);
    process.exit(1);
  }
  return value;
}

async function main() {
  const emails = splitEnv(requireEnv("EMAIL_ADMIN"));
  const firstNames = splitEnv(requireEnv("FIRSTNAME_ADMIN"));
  const lastNames = splitEnv(requireEnv("LASTNAME_ADMIN"));
  const passwords = splitEnv(requireEnv("PASSWORD_ADMIN"));
  const roles = splitEnv(requireEnv("ROLE_ADMIN"));

  const counts = [firstNames, lastNames, passwords, roles].map((list) => list.length);
  if (counts.some((count) => count !== emails.length)) {
    console.error(
      `Incohérence de configuration : ${emails.length} email(s) mais ` +
        `${counts.join("/")} valeurs pour prénom/nom/mot de passe/rôle.`
    );
    process.exit(1);
  }

  for (let i = 0; i < emails.length; i++) {
    const email = emails[i];
    const name = `${firstNames[i]} ${lastNames[i]}`;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log(`  Déjà présent, ignoré : ${email}`);
      continue;
    }

    // Ne jamais journaliser le mot de passe : PASSWORD_ADMIN est un secret réel.
    console.log(`  Création de ${email} (${name})...`);

    const role = Role[roles[i] as keyof typeof Role];
    if (!role) {
      console.error(`  Rôle inconnu pour ${email} : « ${roles[i] } ». Attendu ADMIN ou CUSTOMER.`);
      continue;
    }

    try {
      // `role` fait partie des additionalFields de better-auth : il est attendu
      // dès la création, les autres champs métier sont complétés juste après.
      await auth.api.signUpEmail({
        body: { email, password: passwords[i], name, role },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`  Échec de la création de ${email} : ${message}`);
      continue;
    }

    // better-auth ne connaît pas nos champs métier : on les complète ensuite.
    await prisma.user.update({
      where: { email },
      data: {
        role,
        firstName: firstNames[i],
        lastName: lastNames[i],
        name,
        emailVerified: true,
      },
    });

    console.log(`  Administrateur créé : ${email}`);
  }
}

main()
  .catch((err) => {
    console.error("Échec du seed des administrateurs :", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
