import { NextResponse } from "next/server";

/** OTP برای ورود و بازیابی رمز غیرفعال است. */
export async function POST() {
  return NextResponse.json(
    {
      error: "otp_disabled",
      message: "برای بازیابی رمز از کد ملی استفاده کنید.",
    },
    { status: 410 }
  );
}
