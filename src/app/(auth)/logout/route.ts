import { NextResponse } from "next/server";
import { deleteSessionCookie } from "@/shared/auth";

export async function GET(request: Request) {
  await deleteSessionCookie();
  const url = new URL("/login", request.url);
  return NextResponse.redirect(url);
}

export async function POST(request: Request) {
  await deleteSessionCookie();
  const url = new URL("/login", request.url);
  return NextResponse.redirect(url);
}
