import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const email = String(form.get("email") || "").trim();
  const next = String(form.get("next") || "/modules");

  // You can later validate/record email server-side. For now, accept anything non-empty.
  if (!email) {
    const url = new URL("/", req.url);
    url.searchParams.set("err", "1");
    return NextResponse.redirect(url);
  }

  const res = NextResponse.redirect(new URL(next, req.url));
  // Minimal "session" — free plan
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
  // Optional: store email if you want the client to read it
  res.cookies.set("osai_email", email, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
    secure: true,
    httpOnly: false,
  });

  return res;
}
