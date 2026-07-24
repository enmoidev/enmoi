// Instance client de better-auth (composants "use client" uniquement)
//
// Côté serveur ou dans un script, utiliser l'API serveur `auth.api.*` de lib/auth.ts :
// ce client passe par HTTP et suppose une application démarrée.

import { createAuthClient } from "better-auth/react";

// Le port 3000 est celui de `next dev`. Le fallback ne sert qu'au développement
// local : en déploiement, NEXT_PUBLIC_BETTER_AUTH_URL est toujours défini.
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
});

export const { signIn, signOut, signUp, useSession } = authClient;
