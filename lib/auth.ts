// create auth instance with prisma adapters

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma"; // prisma client adapter
import { nextCookies } from "better-auth/next-js";
import { customSession } from "better-auth/plugins";
import { Resend } from 'resend';
import { reactResetPasswordEmail } from "./email/reset-password";

const resend = new Resend(process.env.RESEND_API_KEY);

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
            await resend.emails.send({
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
