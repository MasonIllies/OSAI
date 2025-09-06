import { NextResponse, NextRequest } from "next/server";

// Pages that require the signup cookie
const PROTECTED = [/^\/calendar(?:\/|$)/, /^\/modules(?:\/|$)/, /^\/account(?:\/|$)/];

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Public routes (landing, pricing, legal, assets, signup, and ALL API routes)
  const PUBLIC = [
    /^\/$/, /^\/pricing(?:\/|$)/, /^\/signin(?:\/|$)/, /^\/signup(?:\/|$)/,
    /^\/legal(?:\/|$)/, /^\/api\/signup(?:\/|$)/, /^\/api(?:\/|$)/,
    /^\/_next\/.*/, /^\/favicon\.ico$/, /^\/images\/.*/
  ];
  if (PUBLIC.some((re) => re.test(pathname))) return NextResponse.next();

  // Gate protected pages
  if (PROTECTED.some((re) => re.test(pathname))) {
    const auth = req.cookies.get("osai_auth")?.value;
    if (auth !== "1") {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      if (pathname !== "/") url.searchParams.set("next", pathname + (search || ""));
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = { matcher: ["/:path*"] };
