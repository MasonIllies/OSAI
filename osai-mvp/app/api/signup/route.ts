// App Router API route: handles POST /api/signup
import { NextRequest, NextResponse } from "next/server";

// Make sure this always runs on the server (no static optimization)
export const dynamic = "force-dynamic"; // <-- ensures no prerender caching
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const email = String(form.get("email") || "").trim();
  const next = String(form.get("next") || "/modules");

  // Require a value so users don't "submit nothing"
  if (!email) {
    const fail = new URL("/", req.url);
    fail.searchParams.set("err", "1");
    return NextResponse.redirect(fail);
  }

  const res = NextResponse.redirect(new URL(next, req.url));

  // Minimal free-plan "session"
  res.cookies.set("osai_auth", "1", {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
    secure: true,
    httpOnly: false,
  });
  res.cookies.set("osai_plan", "free", {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
    secure: true,
    httpOnly: false,
  });
  res.cookies.set("osai_email", email, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
    secure: true,
    httpOnly: false,
  });

  return res;
}

// Optional: respond to accidental GETs so you see something useful in dev
export async function GET(req: NextRequest) {
  return new NextResponse("POST email to /api/signup", { status: 405 });
}
