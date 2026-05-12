import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const username = form.get("username")?.toString() ?? "";
  const password = form.get("password")?.toString() ?? "";
  const from = form.get("from")?.toString() || "/";

  const validUser = process.env.SITE_USERNAME;
  const validPass = process.env.SITE_PASSWORD;

  if (username !== validUser || password !== validPass) {
    return NextResponse.redirect(new URL(`/unlock?from=${encodeURIComponent(from)}&error=1`, req.url));
  }

  const res = NextResponse.redirect(new URL(from, req.url));
  res.cookies.set("site_unlocked", `${validUser}:${validPass}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return res;
}
