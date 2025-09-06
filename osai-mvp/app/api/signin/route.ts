import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const code = String(form.get("code") || "");
  const next = String(form.get("next") || "/calendar");

  const expected = process.env.NEXT_PUBLIC_ACCESS_CODE || "";
  const url = new URL(req.url);

  if (!expected || code !== expected) {
    const fail = new URL("/signin", url.origin);
    fail.searchParams.set("next", next);
    fail.searchParams.set("err", "1");
    return NextResponse.redirect(fail);
  }

  // Set 30-day cookie, then redirect
  const res = NextResponse.redirect(new URL(next, url.origin));
  res.cookies.set("osai_auth", "1", {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
    secure: true,
    httpOnly: false, // client needs to read it for simple checks if you ever add them
  });
  return res;
}
