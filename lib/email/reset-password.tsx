import {Body,Button,Container,Head,Heading,Hr,Html,Link,Preview,Text,Tailwind,Section,Img} from "@react-email/components";

interface BetterAuthResetPasswordEmailProps {
	username?: string;
	resetLink?: string;
}

export const ResetPasswordEmail = ({username,resetLink,}: BetterAuthResetPasswordEmailProps) => {

	const previewText = `Réinitialiser votre mot de passe EnMoi`;
	// Les clients de messagerie ne chargent ni polices ni composants : le logotype
	// doit être une image servie en absolu depuis le site déployé. On retombe sur
	// l'URL d'auth si la variable dédiée n'est pas renseignée, pour éviter un lien cassé.
	const baseUrl =
		process.env.NEXT_PUBLIC_BETTER_AUTH_URL_PROD ||
		process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
		"";
	const imageurl = `${baseUrl}/logo/logo-enmoi.png`;

	return (

		<Html>

			<Head />

			<Preview>{previewText}</Preview>

			<Tailwind>

				<Body className="bg-white my-auto mx-auto font-sans px-2">

					<Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">

						<Img src={imageurl} alt="EnMoi" width="150" height="auto" className="mx-auto my-[20px] rounded"/>

						<Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
							Réinitialisez votre <strong>mot de passe</strong> sur l&apos;application EnMoi.
						</Heading>

						<Text className="text-black text-[14px] leading-[24px]">
							Bonjour {username},
						</Text>

						<Text className="text-black text-[14px] leading-[24px]">
							Nous avons reçu une demande de réinitialisation du mot de passe de votre compte EnMoi. Si vous n&apos;êtes pas à l&apos;origine de cette demande, vous pouvez ignorer cet e-mail en toute sécurité.
						</Text>

						<Section className="text-center mt-[32px] mb-[32px]">
							<Button
								className="bg-[#28939f] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
								href={resetLink}
							>
								Réinitialiser le mot de passe
							</Button>
						</Section>

						<Text className="text-black text-[14px] leading-[24px]">
							Ou copiez et collez cette URL dans votre navigateur :{" "}
							<Link href={resetLink} className="text-blue-600 no-underline">
								{resetLink}
							</Link>
						</Text>

						<Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />

						<Text className="text-[#666666] text-[12px] leading-[24px]">
							Si vous n&apos;avez pas demandé la réinitialisation de votre mot de passe, veuillez ignorer cet e-mail ou contacter le support si vous avez des inquiétudes.
						</Text>
                        
					</Container>

				</Body>

			</Tailwind>

		</Html>

	);
};

export function reactResetPasswordEmail(props: BetterAuthResetPasswordEmailProps,) {
	return <ResetPasswordEmail {...props} />;
}