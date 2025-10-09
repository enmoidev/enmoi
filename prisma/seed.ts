// seed to create sadmin users in the database

// seed dev --> npx tsx prisma/seed.ts
// seed prod --> npx dotenv -e .env.production -- npx tsx prisma/seed.ts

import { signUp } from "../lib/auth-client";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  
  const adminEmailsEnv = process.env.EMAIL_ADMIN;
  const firstNameEnv = process.env.FIRSTNAME_ADMIN;
  const lastNameEnv = process.env.LASTNAME_ADMIN;
  const passwordEnv = process.env.PASSWORD_ADMIN;
  const roleEnv = process.env.ROLE_ADMIN;

  if (!adminEmailsEnv) {
    console.error("EMAIL_ADMIN is not defined in .env");
    process.exit(1);
  }

  if (!passwordEnv) {
    console.error("PASSWORD_ADMIN is not defined in .env");
    process.exit(1);
  }

  if (!lastNameEnv) {
    console.error("LASTNAME_ADMIN is not defined in .env");
    process.exit(1);
  }

  if (!firstNameEnv) {
    console.error("FIRSTNAME_ADMIN is not defined in .env");
    process.exit(1);
  }

  if (!roleEnv) {
    console.error("ROLE_ADMIN is not defined in .env");
    process.exit(1);
  }

  const adminEmails = adminEmailsEnv.split(",").map((e) => e.trim());
  const firstName = firstNameEnv.split(",").map((e) => e.trim());
  const lastName = lastNameEnv.split(",").map((e) => e.trim());
  const password = passwordEnv.split(",").map((e) => e.trim());
  const role = roleEnv.split(",").map((e) => e.trim());

  for (let i = 0; i < adminEmails.length; i++) {
    
    // verify if the user already exists
    const existing = await prisma.user.findUnique({ where: { email:adminEmails[i] } });
    if (existing) {
      console.log(`Admin already exists: ${adminEmails[i]}`);
      continue;
    }

    console.log(adminEmails[i])
    console.log(password[i])
    console.log(firstName[i])
    console.log(lastName[i])

    const { error } = await signUp.email({email:adminEmails[i],password:password[i], name: `${firstName[i]} ${lastName[i]}`,
      fetchOptions: {
        onError: () => {
          console.log(`Error to signup admin user with betterAuth: ${adminEmails[i]}`);
        },
        onSuccess: async () => {
          console.log(`Sucess to signup admin user with betterAuth: ${adminEmails[i]}`);
        },
      },

		});

    if (error) {
      console.log(`Failed to create admin ${adminEmails[i]}:`, error);
    } 
    
    else {

    const name = firstName[i] + " " + lastName[i]
      
    // affect the role and other properties to the user
    await prisma.user.update({
      where: { email:adminEmails[i] },
      data: {
        role: Role[role[i] as keyof typeof Role],
        firstName: firstName[i],
        lastName: lastName[i],
        name: name,
        emailVerified: true,
      },
    });

    console.log(`Admin created: ${adminEmails[i]}`);
    
    }
  }
}

main()

  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());