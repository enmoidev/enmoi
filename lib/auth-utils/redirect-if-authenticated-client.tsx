// redirects authenticated users to their respective dashboard based on their role - CLIENT COMPONENT

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "../auth-client";
import { auth } from "@/lib/auth";

type Session = typeof auth.$Infer.Session;

export default function RedirectIfAuthenticatedClient() {

  const { data: session } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    
    if (!session?.user) return;

    const user = session.user as Session["user"];

    if (user.role === "ADMIN") {
      router.replace("/admin");
    } 

    if (user.role === "CUSTOMER") {
      router.replace("/account");
    } 

    // add other roles here if needed

  }, [session, router]);

  return null;
}