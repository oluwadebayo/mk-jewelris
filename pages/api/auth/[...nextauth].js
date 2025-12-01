// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

const usersFile = path.join(process.cwd(), "users.json");

// Helper: read JSON safely
function readUsers() {
  try {
    const raw = fs.existsSync(usersFile) ? fs.readFileSync(usersFile, "utf8") : "[]";
    return JSON.parse(raw || "[]");
  } catch (err) {
    console.error("readUsers error:", err);
    return [];
  }
}

// Helper: write JSON safely
function writeUsers(data) {
  try {
    fs.writeFileSync(usersFile, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("writeUsers error:", err);
  }
}

export const authOptions = {
  providers: [
    // GOOGLE
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    // CREDENTIALS
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        verifyToken: { label: "Verify Token", type: "text" },
      },

      async authorize(credentials) {
        if (!credentials) throw new Error("No credentials provided");

        const users = readUsers();

        //
        // AUTO-LOGIN AFTER VERIFICATION
        //
        if (credentials.verifyToken) {
          const token = credentials.verifyToken.trim();
          const user = users.find(u => u.verifyToken === token);

          if (!user) throw new Error("INVALID_VERIFY_TOKEN");
          if (Date.now() > (user.verifyExpires || 0)) throw new Error("VERIFY_TOKEN_EXPIRED");

          user.verified = true;
          user.verifyToken = null;
          user.verifyExpires = null;

          writeUsers(users);

          return {
            id: user.id,
            name: user.firstName,
            email: user.email,
            role: user.role || "user",
          };
        }

        //
        // NORMAL LOGIN (with SAFETY DEFAULTS)
        //
        const { email, password } = credentials;
        const user = users.find(u => u.email === email);

        // SAFETY: if user missing or malformed -> return null (credentials invalid)
        if (!user || typeof user !== "object") return null;

        // Must be verified before login
        if (!user.verified) throw new Error(`UNVERIFIED:${email}`);

        // If no passwordHash (e.g. google user), disallow credentials login gracefully
        if (!user.passwordHash) return null;

        const valid = bcrypt.compareSync(password, user.passwordHash);
        if (!valid) throw new Error("INVALID_PASSWORD");

        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          role: user.role || "user",
        };
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    //
    // GOOGLE SIGN-IN → create user in users.json
    //
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const users = readUsers();

        let existing = users.find(u => u.email === user.email);

        if (!existing) {
          const newUser = {
            id: String(Date.now()),
            firstName: user.name?.split(" ")[0] || "",
            lastName: user.name?.split(" ")[1] || "",
            company: "",
            email: user.email,
            verified: true,
            passwordHash: null,
            provider: "google",
            role: "user", // Google users default to user
          };

          users.push(newUser);
          writeUsers(users);
        }
      }

      return true;
    },

    //
    // JWT callback — store role inside the token
    //
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role || "user";
      }
      return token;
    },

    //
    // SESSION callback — expose role to client
    //
    async session({ session, token }) {
      session.user.role = token.role || "user";
      return session;
    },

    //
    // REDIRECT callback — role redirect
    //
    async redirect({ baseUrl, token }) {
      if (!token) return `${baseUrl}/dashboard`;

      if (token.role === "admin") {
        return `${baseUrl}/admin`;
      }

      return `${baseUrl}/dashboard`;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
