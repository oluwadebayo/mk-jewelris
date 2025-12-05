// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

// Server-only env vars — MUST NOT be NEXT_PUBLIC
const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

//
// ⚡ Helper for auto-login using token
//
async function handleVerifyTokenLogin(token) {
  const { data: pending, error: lookupErr } = await supabase
    .from("pending_verifications")
    .select("*")
    .eq("verification_token", token)
    .maybeSingle();

  if (lookupErr) throw new Error("DB_ERROR");
  if (!pending) throw new Error("INVALID_VERIFY_TOKEN");

  // Token expired?
  if (pending.expires_at && new Date(pending.expires_at) < new Date()) {
    await supabase.from("pending_verifications").delete().eq("id", pending.id);
    throw new Error("TOKEN_EXPIRED");
  }

  // Mark user as verified
  const { error: updateErr } = await supabase
    .from("users")
    .update({ verified: true })
    .eq("id", pending.user_id);

  if (updateErr) throw new Error("DB_ERROR");

  // Delete all tokens for this user
  await supabase.from("pending_verifications").delete().eq("user_id", pending.user_id);

  // Fetch updated user
  const { data: user, error: userErr } = await supabase
    .from("users")
    .select("*")
    .eq("id", pending.user_id)
    .maybeSingle();

  if (userErr || !user) throw new Error("USER_NOT_FOUND");

  return {
    id: user.id,
    email: user.email,
    name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
    role: user.role || "user",
  };
}

//
// MAIN NEXTAUTH CONFIG
//
export const authOptions = {
  providers: [
    //
    // GOOGLE LOGIN
    //
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    //
    // CREDENTIALS LOGIN (EMAIL / PASSWORD / AUTO VERIFY LOGIN)
    //
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        verifyToken: { label: "Verify Token", type: "text" },
      },

      async authorize(credentials) {
        try {
          if (!credentials) throw new Error("NO_CREDENTIALS");

          const email = String(credentials.email || "").trim();
          const password = String(credentials.password || "");
          const verifyToken = String(credentials.verifyToken || "").trim();

          //
          // CASE A: auto-login using verifyToken
          //
          if (verifyToken) {
            return await handleVerifyTokenLogin(verifyToken);
          }

          //
          // CASE B: /verify-success.js auto-login
          // email === "jwt" and password === token
          //
          if (email === "jwt" && password.length > 20) {
            return await handleVerifyTokenLogin(password);
          }

          //
          // CASE C: normal email / password login
          //
          if (!email || !password) throw new Error("MISSING_CREDENTIALS");

          const { data: user, error: userErr } = await supabase
            .from("users")
            .select("*")
            .eq("email", email)
            .maybeSingle();

          if (userErr) throw new Error("DB_ERROR");
          if (!user) return null;

          // Must be verified
          if (!user.verified) throw new Error(`UNVERIFIED:${email}`);

          // Compare hash
          const validPassword = bcrypt.compareSync(password, user.password_hash || "");
          if (!validPassword) return null;

          return {
            id: user.id,
            email: user.email,
            name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
            role: user.role || "user",
          };
        } catch (err) {
          console.error("Credentials authorize error:", err);
          throw err;
        }
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    //
    // GOOGLE SIGN IN → insert user if new
    //
    async signIn({ user, account }) {
      try {
        if (account?.provider === "google") {
          const { data: existing } = await supabase
            .from("users")
            .select("*")
            .eq("email", user.email)
            .maybeSingle();

          if (!existing) {
            const parts = (user.name || "").split(" ");

            await supabase.from("users").insert([
              {
                email: user.email,
                verified: true,
                role: "user",
                first_name: parts[0] || "",
                last_name: parts.slice(1).join(" ") || "",
              },
            ]);
          }
        }

        return true;
      } catch (err) {
        console.error("signIn callback error:", err);
        return false;
      }
    },

    //
    // JWT callback
    //
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },

    //
    // Session callback
    //
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },

    //
    // redirect to dashboard after sign in
    //
    async redirect({ baseUrl }) {
      return `${baseUrl}/dashboard`;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

export default (req, res) => NextAuth(req, res, authOptions);
