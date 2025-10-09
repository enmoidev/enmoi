"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function ResetPassword() {

	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");

	const router = useRouter();

	async function handleSubmit(e: React.FormEvent) {

		e.preventDefault();
		setIsSubmitting(true);
		setError("");

        if( password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            setIsSubmitting(false);
            return;
        }

		const res = await authClient.resetPassword({
			newPassword: password,
			token: new URLSearchParams(window.location.search).get("token")!,
		});

		if (res.error) {
			toast.error(res.error.message ?? "Une erreur est survenue, veuillez réessayer.");
		}

		setIsSubmitting(false);
		router.push("/auth/sign-in");
	}

	return (

		<div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">

			<Card className="w-[350px]">

                <CardHeader>
                    <CardTitle>Réinitialiser le mot de passe</CardTitle>
                    <CardDescription>
                        Saisissez un nouveau mot de passe et confirmez-le pour réinitialiser votre mot de passe.
                    </CardDescription>
                </CardHeader>

				<CardContent>

					<form onSubmit={handleSubmit}>

						<div className="grid w-full items-center gap-2">
							<div className="flex flex-col space-y-1.5">
								<Label htmlFor="email">Nouveau mot de passe</Label>
								<Input id="password" type="password" value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) =>setPassword(e.target.value)}
									autoComplete="password"
									placeholder="Votre mot de passe"
								/>
							</div>
							<div className="flex flex-col space-y-1.5">
								<Label htmlFor="email">Confirmer le mot de passe</Label>
								<Input id="password" type="password" value={confirmPassword} onChange={(e: React.ChangeEvent<HTMLInputElement>) =>setConfirmPassword(e.target.value)}
									autoComplete="password"
									placeholder="Votre mot de passe (confirmation)"
								/>
							</div>
						</div>

						{error && (
							<Alert variant="destructive" className="mt-4">
								<AlertCircle className="h-4 w-4" />
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}

						<Button className="w-full mt-4 cursor-pointer" type="submit" disabled={isSubmitting}>
							{isSubmitting ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
						</Button>

					</form>

				</CardContent>

			</Card>

		</div>

	);
}