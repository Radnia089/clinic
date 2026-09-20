import { NextResponse } from "next/server";
import { getAppData, getDashboardStats } from "@/lib/store";

export async function GET() {
  const [data, stats] = await Promise.all([getAppData(), getDashboardStats()]);
  return NextResponse.json({ clinic: data.clinic, stats });
}
