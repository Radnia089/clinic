import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { buildCustomerBackupWorkbook, customerBackupFilename } from "@/lib/customer-backup";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "management") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const file = await buildCustomerBackupWorkbook();
  const filename = customerBackupFilename();
  return new NextResponse(new Uint8Array(file), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Cache-Control": "no-store",
    },
  });
}
