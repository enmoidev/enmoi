// this is component for the admin navbar (desktop)
"use client"

import { signOut } from "../../lib/auth-client";
import { CustomAuthSession } from "@/types/customAuth";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import toast from 'react-hot-toast';

type Props = {
  user: CustomAuthSession["user"];
};

export const NavbarDesktopAdmin = ({ user  }: Props) => {

    const pathname = usePathname();
    const segments = pathname.split("/").filter(Boolean);
    const isReservationPath = segments.includes("reservations");
    let basePath = "/" + segments.slice(0, isReservationPath ? 3 : 2).join("/");

    const handleLogout = async () => {

        await signOut({

        fetchOptions: {

            onError: (ctx) => {

            toast.error(typeof ctx?.error === "string" ? ctx.error : "Un problème est survenu lors de la déconnexion.");

            },
                    
            onSuccess: () => {
            
                window.location.href = "/auth/sign-in";
            
            },

        },
        });

    };

    const navItems = [
        { href: "/admin", label: "Accueil", d: "m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.2" },
        { href: "/admin/aptitudes", label: "Gestion des aptitudes", d: "M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"  },
        { href: "/admin/formules", label: "Gestion des formules", d: "M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V13.5Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V18Zm2.498-6.75h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V13.5Zm0 2.25h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V18Zm2.504-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V18Zm2.498-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5ZM8.25 6h7.5v2.25h-7.5V6ZM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 0 0 2.25 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0 0 12 2.25"  },
        { href: "/admin/pmi", label: "Générer des PMI", d: "M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5A3.375 3.375 0 0 0 6.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0 0 15 2.25h-1.5a2.251 2.251 0 0 0-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 0 0-9-9Z"  },
        { href: "/admin/settings", label: "Paramètres globaux", d: "M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"  },
    ];

    return (
        <nav className="fixed w-64 min-h-[100vh] border-r-2 border-r-gray-200 bg-neutral-50 overflow-y-auto shadow-lg flex flex-col text-gray-500">

        <div>

            <div className="mb-10 flex flex-col gap-2">

                <div className="w-32 h-16 relative self-center">
                <Image
                src={"/logo/logo-inyou.png"}
                alt="logo de inYou"
                fill
                style={{ objectFit: "contain" }}
                priority
                className="self-center pt-4 opacity-95"
                />
                </div>

                <p className="text-xs pl-4 tracking-wide font-semibold">Espace Administrateur inYou</p>

                <div className="flex flex-row items-center pl-4">
                <p className="text-xs tracking-wide font-semibold text-primary">{user.name}</p>
                </div>

            </div>

            <div className="mb-10">

            <ul className="">

                <h3 className="text-xs pl-4 mb-2 tracking-tight">MENU</h3>

                {navItems.map((item) => {
                    const isActive = basePath === item.href;
                    return (
                    <li key={item.href} className={`flex flex-row items-center gap-2 hover:bg-gray-200 ${isActive ? "bg-gray-200" : ""}`}>
                    <div className={`w-2 h-10 rounded-r-lg bg-[var(--primary)] transition-opacity duration-200 ${isActive? "": "opacity-0"}`}></div>
                    <Link href={item.href} className={`flex text-[15px] text-gray-800 flex-row items-center w-full gap-2 py-4 px-1 pl-2 transition tracking-wide`}>
                        <div className="flex items-center justify-center w-6 h-6">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" 
                        className={`w-5 h-5 transition-colors ${isActive ? "text-[var(--primary)]" : "text-gray-600"}`}>
                            <path strokeLinecap="round" strokeLinejoin="round" d={item.d} />
                        </svg>
                        </div>
                        <span className={`${isActive ? "font-bold" : ""}`}>{item.label}</span>
                    </Link>
                    </li>
                    )})}

            </ul>

            </div>

            <div className="mb-10">

            <h3 className="text-xs pl-4 mb-2 tracking-tight">GENERAL</h3>

            <ul className="">
            
                <li className="">
                <button onClick={handleLogout} className="flex flex-row text-red-400 hover:bg-red-100 hover:text-red-500 text gap-2 text-sm items-center w-full text-left cursor-pointer py-4 rounded pl-6 transition tracking-wide">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
                    </svg>
                    Se déconnecter
                    </button>
                </li>

            </ul>

            </div>

        </div>

        </nav>
    );
};

