import { NextResponse } from "next/server";
import { normalizeIntegerInput } from "@/lib/digits";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/** فقط شکل شماره را چک می‌کند و نمی‌گوید این شماره پرونده دارد یا نه. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const phone = normalizeIntegerInput(String(body.phone ?? ""));
  if (!/^09\d{9}$/.test(phone)) {
    return NextResponse.json({ error: "invalid_phone" }, { status: 400 });
  }

  const limited = rateLimit(`check-phone:${clientIp(request)}`, 30, 15 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  return NextResponse.json({ ok: true });
}
