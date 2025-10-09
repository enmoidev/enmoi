import { CustomAuthSession } from "@/types/customAuth";

export function requireRole(session: CustomAuthSession, allowedRoles: string[]) {

  const role = session.user.role;
  
  if (!role || !allowedRoles.includes(role)) {

    throw new Error("Accès non autorisé");

  }
}