import { auth } from "@/lib/auth";
import { CustomAuthSession } from "@/types/customAuth";
import { headers } from "next/headers";

export async function getAuthSession(): Promise<CustomAuthSession> {

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("accès non autorisé");
  }

  const user = {
    ...session.user,
    role: session.user.role ?? null,
  };

  const normalizedSession: CustomAuthSession = {
    user,
    session: session.session,
  };

  return normalizedSession;

}