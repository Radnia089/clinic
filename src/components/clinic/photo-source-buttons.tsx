"use client";

import { useRef } from "react";
import { Camera, ImagePlus } from "lucide-react";

export function PhotoSourceButtons({
  disabled,
  onFiles,
}: {
  disabled?: boolean;
  onFiles: (files: File[], source: "camera" | "gallery") => void;
}) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          event.target.value = "";
          if (files.length) onFiles(files, "camera");
        }}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          event.target.value = "";
          if (files.length) onFiles(files, "gallery");
        }}
      />
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => cameraRef.current?.click()}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#14352A] px-4 text-sm font-extrabold text-white disabled:opacity-60"
        >
          <Camera className="size-4" />
          گرفتن عکس با دوربین
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => galleryRef.current?.click()}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#F7F8F6] px-4 text-sm font-bold text-brand disabled:opacity-60"
        >
          <ImagePlus className="size-4" />
          انتخاب از گالری
        </button>
      </div>
    </>
  );
}

export async function compressPhoto(file: File) {
  const bitmap = await createImageBitmap(file);
  const longest = Math.max(bitmap.width, bitmap.height);
  const scale = Math.min(1, 1600 / longest);
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("canvas");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.72));
  if (!blob) throw new Error("blob");
  return blob;
}
