const MAX_EDGE = 1280;
const TARGET_BYTES = 900 * 1024;

/** هر عکس انتخاب‌شده را به JPEG کوچک تبدیل می‌کند تا سقف آپلود رد نشود. */
export async function compressImageFile(file: File): Promise<File> {
  const looksLikeImage =
    file.type.startsWith("image/") ||
    /\.(jpe?g|png|webp|gif|bmp|heic|heif)$/i.test(file.name);
  if (!looksLikeImage) {
    throw new Error("فقط تصویر می‌توانید انتخاب کنید.");
  }

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) {
    throw new Error("این تصویر خوانده نشد. یک عکس دیگر انتخاب کنید.");
  }

  try {
    let edge = MAX_EDGE;
    let quality = 0.85;
    let blob: Blob | null = null;

    for (let attempt = 0; attempt < 6; attempt += 1) {
      const scale = Math.min(1, edge / Math.max(bitmap.width, bitmap.height));
      const width = Math.max(1, Math.round(bitmap.width * scale));
      const height = Math.max(1, Math.round(bitmap.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("آماده‌سازی تصویر انجام نشد.");
      context.drawImage(bitmap, 0, 0, width, height);
      blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", quality);
      });
      if (blob && blob.size <= TARGET_BYTES) break;
      quality = Math.max(0.45, quality - 0.12);
      edge = Math.round(edge * 0.75);
    }

    if (!blob) throw new Error("کوچک کردن تصویر انجام نشد.");
    return new File([blob], "avatar.jpg", { type: "image/jpeg" });
  } finally {
    bitmap.close();
  }
}
