// create auth instance with prisma adapters

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma"; // prisma client adapter
import { nextCookies } from "better-auth/next-js";
import { customSession } from "better-auth/plugins";
import { Resend } from 'resend';
import { reactResetPasswordEmail } from "./email/reset-password";

// Le client Resend est créé à la demande, et non au chargement du module : son
// constructeur lève si la clé est absente, ce qui faisait échouer le `next build`
// entier alors que l'envoi d'e-mail ne sert qu'à la réinitialisation de mot de passe.
let resendClient: Resend | null = null;

function getResend(): Resend {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY n'est pas défini : impossible d'envoyer l'e-mail de réinitialisation."
    );
  }

  resendClient ??= new Resend(apiKey);
  return resendClient;
}

async function findUser(userId: string) {

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {   role: true, 
            },
  });

  return user;
}

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    user: {
       additionalFields: {
            role: { type: "string", input: true },
        }
    },
    emailAndPassword: {  
        enabled: true,
        minPasswordLength: 8,
        maxPasswordLength: 64,
        async sendResetPassword(data) {
            await getResend().emails.send({
                from: process.env.RESEND_MAIL_FROM!,
                to: data.user.email,
                subject: "Réinitialiser votre mot de passe",
                react: reactResetPasswordEmail({
                    username: data.user.name,
                    resetLink: data.url,
                })
                
            })
        },
    },
    accounts: {
        accountLinking: {
            enabled: true,
        }
    },
    plugins: [nextCookies(),
            customSession(async ({ user, session }) => {
                const userData = await findUser(session.userId);
                return {
                    user: {
                        ...user,
                        role: userData?.role,
                    },
                    session
                };
            }),
    ]
});
