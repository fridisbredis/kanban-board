import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const isLoggedIn = !!req.nextauth.token;
        const isAuthPage = req.nextUrl.pathname.startsWith("/login") ||
            req.nextUrl.pathname.startsWith("/register");

        if (isLoggedIn && isAuthPage) {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }

        return NextResponse.next();
    },
    {
        pages: {
            signIn: "/login",
        },
    }
);

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
