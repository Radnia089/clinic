import { randomBytes } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/db";
import { RECORD_PHOTO_LIMIT } from "@/lib/record-photo-limit";

const PHOTO_ID = /^[a-f0-9]{24}$/;
const PATIENT_ID = /^[a-z0-9]{20,32}$/;

function photoDirectory(patientId: string) {
  if (!PATIENT_ID.test(patientId)) return null;
  return path.join(process.cwd(), ".data", "record-photos", patientId);
}

export function recordPhotoPath(patientId: string, photoId: string) {
  if (!PHOTO_ID.test(photoId)) return null;
  const dir = photoDirectory(patientId);
  if (!dir) return null;
  return path.join(dir, `${photoId}.jpg`);
}

export async function listRecordPhotos(patientId: string) {
  const rows = await prisma.patientPhoto.findMany({
    where: { patientId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true },
  });
  return rows;
}

export async function addRecordPhotos(patientId: string, pages: Buffer[]) {
  if (!PATIENT_ID.test(patientId)) return { saved: [] as string[], skipped: pages.length };
  const current = await prisma.patientPhoto.count({ where: { patientId } });
  const room = Math.max(0, RECORD_PHOTO_LIMIT - current);
  const accepted = pages.slice(0, room);
  const dir = photoDirectory(patientId);
  if (!dir || accepted.length === 0) return { saved: [] as string[], skipped: pages.length };
  await mkdir(dir, { recursive: true });
  const saved: string[] = [];
  for (let index = 0; index < accepted.length; index += 1) {
    const id = randomBytes(12).toString("hex");
    const file = path.join(dir, `${id}.jpg`);
    await writeFile(file, accepted[index]);
    try {
      await prisma.patientPhoto.create({
        data: { id, patientId, sortOrder: current + index },
      });
      saved.push(id);
    } catch (error) {
      await unlink(file).catch(() => undefined);
      throw error;
    }
  }
  return { saved, skipped: pages.length - saved.length };
}

export async function readRecordPhoto(photoId: string) {
  if (!PHOTO_ID.test(photoId)) return null;
  const row = await prisma.patientPhoto.findUnique({ where: { id: photoId } });
  if (!row) return null;
  const file = recordPhotoPath(row.patientId, row.id);
  if (!file) return null;
  try {
    return await readFile(file);
  } catch {
    return null;
  }
}

export async function deleteRecordPhoto(photoId: string) {
  if (!PHOTO_ID.test(photoId)) return false;
  const row = await prisma.patientPhoto.findUnique({ where: { id: photoId } });
  if (!row) return false;
  await prisma.patientPhoto.delete({ where: { id: photoId } });
  const file = recordPhotoPath(row.patientId, row.id);
  if (file) await unlink(file).catch(() => undefined);
  return true;
}
