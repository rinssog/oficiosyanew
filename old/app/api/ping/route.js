import { NextResponse } from "next/server";

// 👇 Export nombrado (no default), exactamente "GET"
export const GET = async () => {
  return NextResponse.json({ ok: true, msg: "ping-app-router" });
};
