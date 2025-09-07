// src/app/api/logout/route.ts
import { logout } from "@/lib/actions/user";
import { NextResponse } from "next/server";

export async function POST() {
  await logout();
  return NextResponse.json({ success: true });
}
