import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { RECORD_PHOTO_LIMIT } from "@/lib/record-photo-limit";

const execFileAsync = promisify(execFile);

export const PHOTO_PAGE_LIMIT = RECORD_PHOTO_LIMIT;
export const PHOTO_PAGE_BYTES = 4 * 1024 * 1024;

export function isPhotoBuffer(bytes: Buffer) {
  if (bytes.length < 12) return false;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return true;
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return true;
  return bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP";
}

function detailOf(error: unknown) {
  if (!error || typeof error !== "object") return "";
  if ("code" in error && error.code === "ENOENT") return "ENOENT";
  const stderr = "stderr" in error ? error.stderr : "";
  if (typeof stderr === "string") return stderr;
  if (Buffer.isBuffer(stderr)) return stderr.toString("utf8");
  return error instanceof Error ? error.message : "";
}

async function recognize(file: string) {
  const { stdout } = await execFileAsync("tesseract", [file, "stdout", "-l", "fas+eng", "--psm", "6"], {
    timeout: 25_000,
    maxBuffer: 2_000_000,
  });
  return stdout;
}

/** عکس‌های پرونده را به متن فارسی تبدیل می‌کند. فایل موقت بعد از خواندن پاک می‌شود. */
export async function readPhotoPages(pages: Buffer[]) {
  const dir = await mkdtemp(join(tmpdir(), "tandis-photo-"));
  const warnings: string[] = [];
  try {
    const chunks: string[] = [];
    for (let index = 0; index < pages.length; index += 1) {
      const file = join(dir, `page-${index}.img`);
      await writeFile(file, pages[index]);
      try {
        const text = (await recognize(file)).replace(/\s+/g, " ").trim();
        if (text) chunks.push(text);
        else warnings.push(`صفحه ${index + 1} متنی نداشت.`);
      } catch (error) {
        const detail = detailOf(error);
        if (/ENOENT|Failed loading language|Error opening data file/.test(detail)) {
          throw new Error("ocr_unavailable");
        }
        warnings.push(`صفحه ${index + 1} خوانده نشد.`);
      }
    }
    return { text: chunks.join("\n").slice(0, 12_000), warnings };
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
