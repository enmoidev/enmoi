// Barre de navigation du back-office sur mobile et tablette — bandeau fixe et panneau dépliant
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "../../lib/auth-client";
import toast from "react-hot-toast";
import { CustomAuthSession } from "@/types/customAuth";
import { LogOut, Menu, X } from "lucide-react";
import { adminNavItems } from "./adminNavItems";
import { BrandLogo } from "./BrandLogo";

type Props = {
  user: CustomAuthSession["user"];
};

export const NavbarMobileAdmin = ({ user }: Props) => {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const basePath = "/" + segments.slice(0, 2).join("/");

  const [isOpen, setIsOpen] = useState(false);

  // Le panneau se referme à la touche Échap, comme n'importe quelle surface
  // superposée de l'interface.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  const handleLogout = async () => {
    await signOut({
      fetchOptions: {
        onError: (ctx) => {
          toast.error(
            typeof ctx?.error === "string" ? ctx.error : "Erreur de déconnexion."
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
      className="banner-surface fixed inset-x-0 top-0 z-50 md:hidden"
    >
      <div className="flex h-16 items-center justify-between gap-3 px-4">
        <Link
          href="/admin"
          className="flex min-w-0 items-center gap-3 rounded-md text-white outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          <BrandLogo tone="white" height={30} priority />
          <span className="eyebrow min-w-0 truncate text-white/90">
            Administration
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-controls="admin-mobile-menu"
          aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
          className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-white/25 text-white transition-colors outline-none hover:bg-white/12 focus-visible:ring-2 focus-visible:ring-white/70"
        >
          {isOpen ? (
            <X aria-hidden="true" className="h-5 w-5" />
          ) : (
            <Menu aria-hidden="true" className="h-5 w-5" />
          )}
        </button>
      </div>

      <div
        id="admin-mobile-menu"
        hidden={!isOpen}
        className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-white/20 pb-6"
      >
        <ul className="flex flex-col gap-0.5 px-3 py-4">
          {adminNavItems.map((item) => {
            const isActive = basePath === item.href;
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative flex items-center gap-3 rounded-lg py-3 pr-3 pl-4 text-white transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
                    isActive ? "bg-white/15" : "hover:bg-white/10"
                  }`}
                >
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
                  <span className="flex min-w-0 flex-col">
                    <span className={isActive ? "font-semibold" : ""}>
                      {item.label}
                    </span>
                    <span className="text-[0.8125rem] text-white/90">
                      {item.hint}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mx-6 h-px bg-white/20" />

        <div className="px-6 pt-4">
          <p className="truncate text-sm font-semibold text-white">{user.name}</p>
          <p className="text-[0.8125rem] text-white/90">Accès administrateur</p>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-white/25 px-3 py-2.5 text-sm text-white transition-colors outline-none hover:bg-white/12 focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <LogOut aria-hidden="true" className="h-4 w-4" />
            Se déconnecter
          </button>
        </div>
      </div>
    </nav>
  );
};
