import { promises as fs } from "fs";
import path from "path";
import sharp from "sharp";

export const UPLOAD_FOLDERS = ["promos", "articles", "champions", "about", "avatars"] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

function uploadsRoot() {
  return path.resolve(process.cwd(), "public", "uploads");
}

export async function shrinkToJpeg(input: Buffer, maxEdge: number, quality = 72) {
  const output = await sharp(input, {
    failOn: "none",
    animated: false,
    limitInputPixels: 24_000_000,
  })
    .rotate()
    .resize({
      width: maxEdge,
      height: maxEdge,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality, chromaSubsampling: "4:2:0" })
    .toBuffer();
  if (!output.length) throw new Error("empty_image");
  return output;
}

export async function saveUploadJpeg(
  folder: Exclude<UploadFolder, "avatars">,
  input: Buffer,
  maxEdge: number
) {
  const jpeg = await shrinkToJpeg(input, maxEdge, 72);
  const name = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.jpg`;
  const dir = path.join(uploadsRoot(), folder);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), jpeg);
  return `/uploads/${folder}/${name}`;
}

export function localUploadPath(url: string) {
  if (!url.startsWith("/uploads/")) return null;
  const parts = url.slice("/uploads/".length).split("/");
  if (parts.length === 0 || parts.some((part) => !part || part === "." || part === "..")) {
    return null;
  }
  const root = uploadsRoot();
  const file = path.resolve(root, ...parts);
  if (file !== root && !file.startsWith(`${root}${path.sep}`)) return null;
  return file;
}

export async function removeStoredUpload(url: string | null | undefined) {
  if (!url) return;
  const file = localUploadPath(url);
  if (!file) return;
  await fs.unlink(file).catch(() => undefined);
}

export async function sweepUnreferencedUploads(
  referencedText: string,
  minAgeMs = 60 * 60 * 1000
) {
  const root = uploadsRoot();
  const now = Date.now();
  for (const folder of UPLOAD_FOLDERS) {
    const dir = path.join(root, folder);
    let names: string[] = [];
    try {
      names = await fs.readdir(dir);
    } catch {
      continue;
    }
    for (const name of names) {
      if (name.startsWith(".")) continue;
      const file = path.join(dir, name);
      const url = `/uploads/${folder}/${name}`;
      if (referencedText.includes(url)) continue;
      const stat = await fs.stat(file).catch(() => null);
      if (!stat?.isFile()) continue;
      if (minAgeMs > 0 && now - stat.mtimeMs < minAgeMs) continue;
      await fs.unlink(file).catch(() => undefined);
    }
  }
}

async function recompressJpegFile(
  file: string,
  maxEdge: number,
  quality: number,
  minBytes: number
) {
  const stat = await fs.stat(file).catch(() => null);
  if (!stat?.isFile() || stat.size < minBytes) return false;
  const input = await fs.readFile(file);
  let output: Buffer;
  try {
    output = await shrinkToJpeg(input, maxEdge, quality);
  } catch {
    return false;
  }
  if (output.length >= input.length) return false;
  const temporary = `${file}.tmp`;
  await fs.writeFile(temporary, output);
  await fs.rename(temporary, file);
  return true;
}

export async function recompressStoredPhotos() {
  const photosRoot = path.join(process.cwd(), ".data", "record-photos");
  let patients: string[] = [];
  try {
    patients = await fs.readdir(photosRoot);
  } catch {
    patients = [];
  }
  for (const patient of patients) {
    if (patient.startsWith(".")) continue;
    const dir = path.join(photosRoot, patient);
    let files: string[] = [];
    try {
      files = await fs.readdir(dir);
    } catch {
      continue;
    }
    for (const name of files) {
      if (!name.endsWith(".jpg") || name.endsWith(".tmp")) continue;
      await recompressJpegFile(path.join(dir, name), 1400, 68, 280 * 1024);
    }
  }

  const avatars = path.join(process.cwd(), ".data", "avatars");
  let avatarFiles: string[] = [];
  try {
    avatarFiles = await fs.readdir(avatars);
  } catch {
    avatarFiles = [];
  }
  for (const name of avatarFiles) {
    if (!name.endsWith(".jpg") || name.endsWith(".tmp")) continue;
    await recompressJpegFile(path.join(avatars, name), 512, 70, 80 * 1024);
  }
}
