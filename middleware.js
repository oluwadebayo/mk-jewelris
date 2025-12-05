import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
const token = await getToken({
req,
secret: process.env.NEXTAUTH_SECRET,

// 🔥 IMPORTANT: Fix Vercel cookie parsing
secureCookie: process.env.NODE_ENV === "production",

});

const { pathname } = req.nextUrl;

// Not logged in → block dashboard & admin
if (!token) {
if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
return NextResponse.redirect(new URL("/login", req.url));
}
return NextResponse.next();
}

// Logged-in but NOT admin → block admin
if (pathname.startsWith("/admin") && token.role !== "admin") {
return NextResponse.redirect(new URL("/dashboard", req.url));
}

return NextResponse.next();
}

export const config = {
matcher: ["/dashboard/:path*", "/admin/:path*"],
};
