
export type CustomAuthSession = {
  user: {
    id: string;
    name: string;
    email: string;
    role: string | null;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    image?: string | null; // <-- accepte null maintenant
  };
  
  session: {
    id: string;
    token: string;
    userId: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
    ipAddress?: string | null;
    userAgent?: string | null;
  };
};