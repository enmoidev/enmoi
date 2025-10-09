// homepage for inyou web site and redirect to appp with auth or redirect to login / signup

import RedirectIfAuthenticatedServer from "../lib/auth-utils/redirect-if-authenticated-server";
import Image from "next/image";
import Link from "next/link";

export default async function Home() {

  await RedirectIfAuthenticatedServer()

  return (
<>

    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        
        <Image src="/logo/logo-inyou.png" alt="logo de InYou" width={180} height={38} priority className="w-[180px] h-auto"/>

        <p className="tracking-wide text-md text-center sm:text-left text-black">
          Bienvenue dans l'application <b>inYou</b>.
        </p>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Link
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-hoverForeground font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="/auth/sign-in"
          >
            Se connecter
          </Link>

          <Link
            className="rounded-full border border-solid cursor-default border-black/[.08] flex items-center justify-center text-gray-300 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
            href=""
          >
            S&apos;inscrire
          </Link>

        </div>
      </main>

    </div>
</>
  );
}
