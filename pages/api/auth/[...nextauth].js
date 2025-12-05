// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
        verifyToken: {},
      },

      async authorize(credentials) {
        if (!credentials) throw new Error("NO_CREDENTIALS");

        // 1️⃣ Auto login after email verification
        if (credentials.verifyToken) {
          const token = credentials.verifyToken.trim();

          const { data: pending } = await supabase
            .from("pending_verifications")
            .select("*")
            .eq("verification_token", token)
            .maybeSingle();

          if (!pending) throw new Error("INVALID_VERIFY_TOKEN");

          // Mark user verified
          await supabase
            .from("users")
            .update({ verified: true })
            .eq("id", pending.user_id);

          // Remove all tokens
          await supabase
            .from("pending_verifications")
            .delete()
            .eq("user_id", pending.user_id);

          // Fetch updated user
          const { data: user } = await supabase
            .from("users")
            .select("*")
            .eq("id", pending.user_id)
            .maybeSingle();

          return {
            id: user.id,
            email: user.email,
            name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
            role: user.role || "user",
          };
        }

        // 2️⃣ Normal login
        const { email, password } = credentials;
        if (!email || !password) throw new Error("MISSING_CREDENTIALS");

        const { data: user } = await supabase
          .from("users")
          .select("*")
          .eq("email", email)
          .maybeSingle();

        if (!user) return null;

        if (!user.verified) throw new Error(`UNVERIFIED:${email}`);

        const isValid = bcrypt.compareSync(password, user.password_hash);
        if (!isValid) throw new Error("INVALID_PASSWORD");

        return {
          id: user.id,
          email: user.email,
          name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
          role: user.role,
        };
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async signIn({ user, account }) {
      // Google: create supabase user if not exist
      if (account?.provider === "google") {
        const { data: existing } = await supabase
          .from("users")
          .select("*")
          .eq("email", user.email)
          .maybeSingle();

        if (!existing) {
          await supabase.from("users").insert([
            {
              email: user.email,
              verified: true,
              role: "user",
              first_name: user.name?.split(" ")[0] || "",
              last_name: user.name?.split(" ")[1] || "",
            },
          ]);
        }
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },

    async redirect({ baseUrl }) {
      return baseUrl + "/dashboard";
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

export default (req, res) => NextAuth(req, res, authOptions);
