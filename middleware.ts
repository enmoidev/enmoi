import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// this middlware dont check role (make directly on api routes)
export async function middleware(req: NextRequest) {
	const { pathname } = req.nextUrl;

	if (pathname.startsWith("/api/auth")) {
		return NextResponse.next();
	}

	// fast checking : verification if cookie of session is present
	const sessionCookie = getSessionCookie(req);

	// if user have not session cookie, reject here
	if (!sessionCookie) {
		return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
	}

	// else user pass and verification of roles is inside API routes
	return NextResponse.next();
}

export const config = {
	matcher: ["/api/:path*"],
};