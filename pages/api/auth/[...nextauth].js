// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

// Use server-only env names. These should be set in Vercel (not prefixed with NEXT_PUBLIC).
// - SUPABASE_URL
// - SUPABASE_SERVICE_ROLE_KEY
// - GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
// - NEXTAUTH_SECRET
const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    CredentialsProvider({
      name: "Credentials",
      // These are the fields that can be passed to signIn('credentials', ...)
      credentials: {
        email: { label: "Email", type: "text", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
        verifyToken: { label: "Verify Token", type: "text", placeholder: "one-time token (optional)" },
      },

      async authorize(credentials) {
        try {
          if (!credentials) throw new Error("NO_CREDENTIALS");

          // --- CASE A: Auto-login via verifyToken (preferred for "click link -> auto login" flow)
          // If the client calls signIn("credentials", { verifyToken }), we match token & return the user.
          if (credentials.verifyToken) {
            const token = String(credentials.verifyToken).trim();

            if (!token) throw new Error("INVALID_VERIFY_TOKEN");

            const { data: pending, error: lookupErr } = await supabase
              .from("pending_verifications")
              .select("*")
              .eq("verification_token", token)
              .maybeSingle();

            if (lookupErr) {
              console.error("Supabase (pending lookup) error:", lookupErr);
              throw new Error("DB_ERROR");
            }

            if (!pending) {
              throw new Error("INVALID_VERIFY_TOKEN");
            }

            // Ensure token hasn't expired
            if (pending.expires_at && new Date(pending.expires_at) < new Date()) {
              // Delete the expired token to clean up
              try {
                await supabase.from("pending_verifications").delete().eq("id", pending.id);
              } catch (e) {
                console.warn("Failed to delete expired token:", e);
              }
              throw new Error("TOKEN_EXPIRED");
            }

            // Mark user as verified
            const { error: markErr } = await supabase
              .from("users")
              .update({ verified: true })
              .eq("id", pending.user_id);

            if (markErr) {
              console.error("Failed to mark user verified:", markErr);
              throw new Error("DB_ERROR");
            }

            // Remove any pending tokens for this user
            try {
              await supabase.from("pending_verifications").delete().eq("user_id", pending.user_id);
            } catch (e) {
              console.warn("Failed to cleanup pending_verifications:", e);
            }

            // Fetch the updated user row
            const { data: user, error: userErr } = await supabase
              .from("users")
              .select("*")
              .eq("id", pending.user_id)
              .maybeSingle();

            if (userErr) {
              console.error("Failed to fetch user after verification:", userErr);
              throw new Error("DB_ERROR");
            }

            if (!user) throw new Error("USER_NOT_FOUND");

            return {
              id: user.id,
              email: user.email,
              name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
              role: user.role || "user",
            };
          }

          // --- CASE B: Regular email + password login
          const email = String(credentials.email || "").trim();
          const password = String(credentials.password || "");

          if (!email || !password) {
            throw new Error("MISSING_CREDENTIALS");
          }

          const { data: user, error: userErr } = await supabase
            .from("users")
            .select("*")
            .eq("email", email)
            .maybeSingle();

          if (userErr) {
            console.error("Supabase (users) error:", userErr);
            throw new Error("DB_ERROR");
          }

          if (!user) {
            // returning null signals "invalid credentials" to NextAuth
            return null;
          }

          // Ensure user is verified
          if (!user.verified) {
            // Throwing an Error will forward an error message to the signIn page as ?error=...
            throw new Error(`UNVERIFIED:${email}`);
          }

          // Compare hashed password
          const isValid = bcrypt.compareSync(password, user.password_hash || "");
          if (!isValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
            role: user.role || "user",
          };
        } catch (err) {
          // Authorize should either return a user object, null, or throw an error.
          console.error("Credentials authorize error:", err);
          throw err;
        }
      },
    }),
  ],

  // use JWT sessions (recommended for API-based auth + Vercel)
  session: { strategy: "jwt" },

  callbacks: {
    // Called when a user signs in (OAuth or credentials)
    async signIn({ user, account, profile }) {
      try {
        // If Google, ensure user exists in our users table and is marked verified
        if (account?.provider === "google") {
          const { data: existing, error: findErr } = await supabase
            .from("users")
            .select("*")
            .eq("email", user.email)
            .maybeSingle();

          if (findErr) {
            console.error("Supabase (find user on google signIn) error:", findErr);
            // let signIn succeed; we'll create user below if needed
          }

          if (!existing) {
            // create the user row and mark verified true
            const nameParts = (user.name || "").split(" ");
            try {
              await supabase.from("users").insert([
                {
                  email: user.email,
                  verified: true,
                  role: "user",
                  first_name: nameParts[0] || "",
                  last_name: nameParts.slice(1).join(" ") || "",
                },
              ]);
            } catch (e) {
              console.error("Failed to create user on Google signIn:", e);
            }
          }
        }

        return true;
      } catch (err) {
        console.error("signIn callback error:", err);
        return false;
      }
    },

    // Add id + role into the JWT token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || "user";
      }
      return token;
    },

    // Expose id + role on the session object returned to the client
    async session({ session, token }) {
      if (token) {
        session.user = session.user || {};
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },

    // After sign in redirect users to /dashboard
    async redirect({ baseUrl }) {
      return baseUrl + "/dashboard";
    },
  },

  pages: {
    signIn: "/login", // custom login page
  },

  secret: process.env.NEXTAUTH_SECRET,
};

export default (req, res) => NextAuth(req, res, authOptions);
