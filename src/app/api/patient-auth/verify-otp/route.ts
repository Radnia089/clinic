import { NextResponse } from "next/server";

/** ورود روزانه با OTP غیرفعال است؛ از مسیر رمز / فراموشی رمز استفاده شود. */
export async function POST() {
  return NextResponse.json(
    { error: "otp_login_disabled", message: "برای ورود از رمز استفاده کنید." },
    { status: 410 }
  );
}
