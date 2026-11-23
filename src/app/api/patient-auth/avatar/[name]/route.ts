import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getCurrentUser } from "@/lib/auth";
import { getCurrentPatient } from "@/lib/patient-auth";

const NAME = /^([a-z0-9]+)\.(jpg|png|webp)$/;

const TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ name: string }> }
) {
  const { name } = await context.params;
  const match = NAME.exec(name);
  if (!match) {
    return new NextResponse(null, { status: 404 });
  }
  const id = match[1];
  const ext = match[2];

  const staff = await getCurrentUser();
  const patient = staff ? null : await getCurrentPatient();
  if (!staff && patient?.id !== id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const file = path.join(process.cwd(), ".data", "avatars", `${id}.${ext}`);
  const buffer = await fs.readFile(file).catch(() => null);
  if (!buffer) {
    return new NextResponse(null, { status: 404 });
  }

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": TYPES[ext] ?? "application/octet-stream",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
