import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

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
        callbacks: {
            authorized: ({ req }) => {
                const isAuthPage = req.nextUrl.pathname.startsWith("/login") ||
                    req.nextUrl.pathname.startsWith("/register");
                return isAuthPage ? true : !!req.cookies.get("next-auth.session-token");
            },
        },
        pages: {
            signIn: "/login",
        },
    }

);
