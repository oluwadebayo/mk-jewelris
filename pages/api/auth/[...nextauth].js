// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

// --------------------------------------------------
// AUTO LOGIN FROM EMAIL VERIFICATION
// --------------------------------------------------
async function handleVerifyTokenLogin(token) {
  const { data: pending } = await supabase
    .from("pending_verifications")
    .select("*")
    .eq("verification_token", token)
    .maybeSingle();

  if (!pending) throw new Error("INVALID_VERIFY_TOKEN");

  if (pending.expires_at && new Date(pending.expires_at) < new Date()) {
    await supabase.from("pending_verifications").delete().eq("id", pending.id);
    throw new Error("TOKEN_EXPIRED");
  }

  await supabase.from("users")
    .update({ verified: true })
    .eq("id", pending.user_id);

  await supabase.from("pending_verifications").delete().eq("user_id", pending.user_id);

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
        if (!credentials) throw new Error("NO_CREDENTIALS");

        const { email, password, verifyToken } = credentials;

        if (verifyToken) return await handleVerifyTokenLogin(verifyToken);

        if (email === "jwt" && password.length > 20)
          return await handleVerifyTokenLogin(password);

        if (!email || !password) throw new Error("MISSING_CREDENTIALS");

        const { data: user } = await supabase
          .from("users")
          .select("*")
          .eq("email", email)
          .maybeSingle();

        if (!user) return null;

        if (!user.verified) throw new Error(`UNVERIFIED:${email}`);

        const validPassword = bcrypt.compareSync(password, user.password_hash);
        if (!validPassword) return null;

        return {
          id: user.id,
          email: user.email,
          name: `${user.first_name} ${user.last_name}`.trim(),
          role: user.role || "user",
        };
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async signIn({ user, account }) {
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
    },

    // -------------------- FIXED JWT CALLBACK --------------------
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
        return token;
      }

      // If Google login does NOT supply role, we fetch it from DB
      if (!token.role && token.email) {
        const { data: dbUser } = await supabase
          .from("users")
          .select("id, role")
          .eq("email", token.email)
          .maybeSingle();

        if (dbUser) {
          token.id = dbUser.id || token.id;
          token.role = dbUser.role || "user";
        } else {
          token.role = "user";
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
