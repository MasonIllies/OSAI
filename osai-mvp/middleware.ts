import { NextResponse, NextRequest } from "next/server";

const PROTECTED = [/^\/calendar(?:\/|$)/, /^\/modules(?:\/|$)/, /^\/account(?:\/|$)/];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // public paths
  const PUBLIC = [
    /^\/$/, /^\/pricing(?:\/|$)/, /^\/signin(?:\/|$)/,
    /^\/legal(?:\/|$)/, /^\/api(?:\/|$)/, /^\/_next\/.*/, /^\/favicon\.ico$/, /^\/images\/.*/
  ];
  if (PUBLIC.some((re) => re.test(pathname))) return NextResponse.next();

  // require cookie for protected
  if (PROTECTED.some((re) => re.test(pathname))) {
    const cookie = req.cookies.get("osai_auth")?.value;
    if (cookie !== "1") {
      const url = req.nextUrl.clone();
      url.pathname = "/signin";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Run on everything so we can quickly decide
export const config = {
  matcher: ["/:path*"],
};
