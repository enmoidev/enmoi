// Récupère la session courante côté serveur, ou échoue

import { auth } from "@/lib/auth";
import { CustomAuthSession } from "@/types/customAuth";
import { headers } from "next/headers";
import { UnauthorizedError } from "./errors";

export async function getAuthSession(): Promise<CustomAuthSession> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new UnauthorizedError();
  }

  return {
    user: {
      ...session.user,
      role: session.user.role ?? null,
    },
    session: session.session,
  };
}
