import NextAuth, { DefaultSession } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "INTERN" | "ADMIN";
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "INTERN" | "ADMIN";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "INTERN" | "ADMIN";
  }
}
