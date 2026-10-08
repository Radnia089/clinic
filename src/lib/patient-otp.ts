import { promises as fs } from "fs";
import path from "path";

type OtpRecord = {
  phone: string;
  code: string;
  expiresAt: number;
  attempts: number;
};

const OTP_FILE = path.join(process.cwd(), ".data", "patient-otp.json");
const OTP_TTL_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;

async function readAll(): Promise<Record<string, OtpRecord>> {
  try {
    const raw = await fs.readFile(OTP_FILE, "utf8");
    return JSON.parse(raw) as Record<string, OtpRecord>;
  } catch {
    return {};
  }
}

async function writeAll(data: Record<string, OtpRecord>) {
  await fs.mkdir(path.dirname(OTP_FILE), { recursive: true });
  await fs.writeFile(OTP_FILE, JSON.stringify(data, null, 2), "utf8");
}

function generateCode() {
  return String(Math.floor(10000 + Math.random() * 90000));
}

export async function issuePatientOtp(phone: string) {
  const data = await readAll();
  const code = generateCode();
  data[phone] = {
    phone,
    code,
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
  };
  await writeAll(data);
  return code;
}

export async function verifyPatientOtp(phone: string, code: string) {
  const data = await readAll();
  const record = data[phone];
  if (!record) return { ok: false as const, error: "not_found" };
  if (Date.now() > record.expiresAt) {
    delete data[phone];
    await writeAll(data);
    return { ok: false as const, error: "expired" };
  }
  if (record.attempts >= MAX_ATTEMPTS) {
    delete data[phone];
    await writeAll(data);
    return { ok: false as const, error: "too_many" };
  }
  if (record.code !== code.trim()) {
    record.attempts += 1;
    data[phone] = record;
    await writeAll(data);
    return { ok: false as const, error: "invalid" };
  }
  delete data[phone];
  await writeAll(data);
  return { ok: true as const };
}
