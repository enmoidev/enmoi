// Barre de navigation du back-office sur grand écran — le bandeau turquoise du PMI, en colonne
"use client";

import { signOut } from "../../lib/auth-client";
import { CustomAuthSession } from "@/types/customAuth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import toast from "react-hot-toast";
import { LogOut } from "lucide-react";
import { adminNavItems } from "./adminNavItems";
import { BrandMark } from "./BrandMark";

type Props = {
  user: CustomAuthSession["user"];
};

export const NavbarDesktopAdmin = ({ user }: Props) => {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const basePath = "/" + segments.slice(0, 2).join("/");

  const handleLogout = async () => {
    await signOut({
      fetchOptions: {
        onError: (ctx) => {
          toast.error(
            typeof ctx?.error === "string"
              ? ctx.error
              : "Un problème est survenu lors de la déconnexion."
          );
        },

        onSuccess: () => {
          window.location.href = "/auth/sign-in";
        },
      },
    });
  };

  return (
    <nav
      aria-label="Navigation principale"
      className="banner-surface sticky top-0 flex h-screen w-full flex-col overflow-y-auto"
    >
      <div className="flex flex-col gap-1 px-6 pt-8 pb-7">
        <Link
          href="/admin"
          className="w-fit rounded-md text-white outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
        >
          <BrandMark className="text-4xl" />
        </Link>
        <p className="eyebrow mt-3 text-white/90">Espace administrateur</p>
      </div>

      <div className="mx-6 h-px bg-white/20" />

      <div className="flex flex-1 flex-col px-3 py-6">
        <ul className="flex flex-col gap-0.5">
          {adminNavItems.map((item) => {
            const isActive = basePath === item.href;
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative flex items-center gap-3 rounded-lg py-2.5 pr-3 pl-4 text-[0.9375rem] text-white transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
                    isActive ? "bg-white/15 font-semibold" : "hover:bg-white/10"
                  }`}
                >
                  {/* Filet actif : le même repère vertical que dans le document. */}
                  <span
                    aria-hidden="true"
                    className={`absolute top-2 bottom-2 left-0 w-[3px] rounded-full bg-white transition-opacity ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  <Icon
                    aria-hidden="true"
                    className={`h-[18px] w-[18px] shrink-0 ${
                      isActive ? "opacity-100" : "opacity-70"
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-auto px-6 pb-7">
        <div className="mb-4 h-px bg-white/20" />

        <p className="truncate text-sm font-semibold text-white">{user.name}</p>
        <p className="text-[0.8125rem] text-white/90">Accès administrateur</p>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-4 flex w-full cursor-pointer items-center gap-2 rounded-lg border border-white/25 px-3 py-2 text-sm text-white transition-colors outline-none hover:bg-white/12 focus-visible:ring-2 focus-visible:ring-white/70"
        >
          <LogOut aria-hidden="true" className="h-4 w-4" />
          Se déconnecter
        </button>
      </div>
    </nav>
  );
};
