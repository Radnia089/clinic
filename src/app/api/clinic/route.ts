import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getAppData, getDashboardStats } from "@/lib/store";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const [data, stats] = await Promise.all([getAppData(), getDashboardStats()]);
  return NextResponse.json({ clinic: data.clinic, stats });
}
