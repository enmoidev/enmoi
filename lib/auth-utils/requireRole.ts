// Vérifie que la session porte l'un des rôles attendus

import { CustomAuthSession } from "@/types/customAuth";
import { ForbiddenError } from "./errors";

export function requireRole(session: CustomAuthSession, allowedRoles: string[]) {
  const role = session.user.role;

  if (!role || !allowedRoles.includes(role)) {
    throw new ForbiddenError();
  }
}
