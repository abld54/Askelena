import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as ReturnType<typeof PrismaAdapter>,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // Auto-promote anaelb90@gmail.com to host
        const AUTO_ADMIN_EMAILS = ["anaelb90@gmail.com"];
        if (user.email && AUTO_ADMIN_EMAILS.includes(user.email)) {
          await prisma.user.update({
            where: { id: user.id! },
            data: { role: "host" },
          });
          token.role = "host";
        } else {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id! },
            select: { role: true },
          });
          token.role = dbUser?.role ?? "guest";
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as unknown as Record<string, unknown>).role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.AUTH_SECRET,
});
