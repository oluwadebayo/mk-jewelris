// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { supabaseServer } from "../../../lib/supabase";

//
// Helper: auto-login via verification token
//
async function handleVerifyTokenLogin(token) {
  const { data: pending, error: lookupErr } = await supabaseServer
    .from("pending_verifications")
    .select("*")
    .eq("verification_token", token)
    .maybeSingle();

  if (lookupErr) throw new Error("DB_ERROR");
  if (!pending) throw new Error("INVALID_VERIFY_TOKEN");

  // Token expired?
  if (pending.expires_at && new Date(pending.expires_at) < new Date()) {
    await supabaseServer.from("pending_verifications").delete().eq("id", pending.id);
    throw new Error("TOKEN_EXPIRED");
  }

  // Mark user as verified
  const { error: updateErr } = await supabaseServer
    .from("users")
    .update({ verified: true })
    .eq("id", pending.user_id);

  if (updateErr) throw new Error("DB_ERROR");

  // Delete tokens for this user
  await supabaseServer.from("pending_verifications").delete().eq("user_id", pending.user_id);

  // Fetch updated user
  const { data: user, error: userErr } = await supabaseServer
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

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

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

          // Auto-login using verifyToken
          if (verifyToken) {
            return await handleVerifyTokenLogin(verifyToken);
          }

          // Legacy auto-login case used elsewhere
          if (email === "jwt" && password.length > 20) {
            return await handleVerifyTokenLogin(password);
          }

          if (!email || !password) throw new Error("MISSING_CREDENTIALS");

          const { data: user, error: userErr } = await supabaseServer
            .from("users")
            .select("*")
            .eq("email", email)
            .maybeSingle();

          if (userErr) throw new Error("DB_ERROR");
          if (!user) return null;

          if (!user.verified) throw new Error(`UNVERIFIED:${email}`);

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
    async signIn({ user, account }) {
      try {
        // On Google sign in, insert user if not exists
        if (account?.provider === "google") {
          const { data: existing, error: existingErr } = await supabaseServer
            .from("users")
            .select("*")
            .eq("email", user.email)
            .maybeSingle();

          if (existingErr) throw existingErr;

          if (!existing) {
            const parts = (user.name || "").split(" ");
            await supabaseServer.from("users").insert([
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

    // JWT callback - ensure role/id present
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
        return token;
      }

      // If role missing, try fetching by email
      if (!token.role && token.email) {
        try {
          const { data: dbUser, error } = await supabaseServer
            .from("users")
            .select("id, role")
            .eq("email", token.email)
            .maybeSingle();

          if (!error && dbUser) {
            token.id = dbUser.id || token.id;
            token.role = dbUser.role || "user";
          } else {
            token.role = token.role || "user";
          }
        } catch (e) {
          token.role = token.role || "user";
        }
      }

      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },

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
