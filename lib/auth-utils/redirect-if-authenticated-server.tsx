// redirects authenticated users to their respective dashboard based on their role - SERVER COMPONENT

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function RedirectIfAuthenticatedServer() {

  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) return;

  const role = session.user.role;

  if (role === "ADMIN") {
    redirect("/admin");
  }

  if (role === "CUSTOMER") {
    redirect("/account");
  }

  // add other roles here if needed
}