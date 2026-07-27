"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { signIn } from "../../../../lib/auth-client";
import Link from "next/link";
import toast from 'react-hot-toast';
import { BrandLogo } from "@/components/navbar/BrandLogo";
import Image from "next/image";
import { useRouter } from "next/navigation";
import RedirectIfAuthenticatedClient from "../../../../lib/auth-utils/redirect-if-authenticated-client";
import { Eye, EyeOff } from "lucide-react";

export default function SignIn() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const router = useRouter();


    const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {

      event.preventDefault();

      await signIn.email({ email, password },{

          onRequest: () => setLoading(true),

          onResponse: () => setLoading(false),

          onError: (ctx) => {
            setLoading(false);
            toast.error(typeof ctx?.error === "string" ? ctx.error : "Email ou mot de passe incorrect.");
          },
          
          onSuccess: (ctx) => {

            setLoading(false);

            // La destination suit le rôle porté par la session. L'implémentation
            // précédente comparait le nom de l'utilisateur à une liste exposée
            // côté navigateur via NEXT_PUBLIC_NAME_ADMIN : deux administrateurs
            // homonymes, ou un simple changement de nom, faussaient la redirection.
            // La protection réelle reste le contrôle de rôle du layout serveur.
            const role = (ctx.data?.user as { role?: string } | undefined)?.role;

            router.push(role === "ADMIN" ? "/admin" : "/account");
          },
      });
    };

  return (
<>
    <RedirectIfAuthenticatedClient />

    <div className="flex min-h-screen">

    <div className="hidden lg:block lg:w-3/5 relative">

      <Image src="/pictures/main-enmoi.png" alt="" fill sizes="60vw" className="object-cover" priority/>

    </div>

    <div className="relative w-full lg:w-3/5 flex flex-col items-center justify-center mx-4 sm:mx-6">

    <Link
      href="/"
      className="absolute left-4 top-4 inline-flex items-center gap-1.5 text-sm text-neutral-500 transition-colors hover:text-primary sm:left-6 sm:top-6"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      Retour au site
    </Link>

    <div className="justify-center items-center text-center lg:p-8 w-full p-4 lg:w-2/3">
      <BrandLogo height={48} priority className="mx-auto mb-6" />
      <h1 className="text-3xl">Bonjour !</h1>
      <p className="pt-1">Bienvenue sur l&apos;application <b>EnMoi</b>, pour découvrir votre alignement inné-acquis et votre potentiel mental.</p>
    </div>

    <Card className="w-full lg:m-4 max-w-md shadow-lg">

      <CardHeader>
        <CardTitle className="text-lg md:text-xl text-hoverForeground">Se connecter</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Entrez votre email et votre mot de passe ci-dessous pour vous connecter à votre compte
        </CardDescription>
      </CardHeader>

      <CardContent>

        <form onSubmit={handleLogin} className="grid gap-4">

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Votre adresse email" required onChange={(e) => {setEmail(e.target.value);}} value={email}/>
            </div>

            <div className="grid gap-2 relative">

              <div className="flex items-center">
                <Label htmlFor="password">Mot de passe</Label>
                <Link href="/auth/forget-password" className="ml-auto inline-block text-sm underline">Mot de passe oublié ?</Link>
              </div>

              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="Votre mot de passe" autoComplete="password" value={password} onChange={(e) => setPassword(e.target.value)}required/>
                <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 p-1" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

            </div>

            <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
                ) 
                : (
                <p className="tracking-wide">Se connecter</p>
                )
              }
            </Button>

        </form>

      </CardContent>
      
    </Card>

    </div>
    </div>
</>
  );
}