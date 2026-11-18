"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { compressPhoto, PhotoSourceButtons } from "@/components/clinic/photo-source-buttons";
import { RECORD_PHOTO_LIMIT } from "@/lib/record-photo-limit";

export function RecordPhotosCard({
  patientId,
  initialPhotos,
}: {
  patientId: string;
  initialPhotos: Array<{ id: string }>;
}) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function add(files: File[]) {
    const room = RECORD_PHOTO_LIMIT - photos.length;
    const accepted = files.filter((file) => file.size > 0).slice(0, Math.max(0, room));
    if (!accepted.length) {
      setError("هر پرونده حداکثر ۸ عکس دارد.");
      return;
    }
    setPending(true);
    setError(accepted.length < files.length ? "هر پرونده حداکثر ۸ عکس دارد." : "");
    try {
      const body = new FormData();
      for (const file of accepted) {
        body.append("pages", await compressPhoto(file), "page.jpg");
      }
      const response = await fetch(`/api/clinic/patients/${patientId}/photos`, { method: "POST", body });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(response.status === 400 ? "این عکس‌ها اضافه نشد." : "ذخیره عکس انجام نشد.");
        return;
      }
      const added = Array.isArray(data.photos) ? data.photos : [];
      setPhotos((current) => [...current, ...added.filter((item: { id?: string }) => item?.id)]);
    } catch {
      setError("این عکس خوانده نشد. از دوربین یا گالری یک عکس معمولی انتخاب کنید.");
    } finally {
      setPending(false);
    }
  }

  async function remove(id: string) {
    const previous = photos;
    setPhotos((current) => current.filter((photo) => photo.id !== id));
    const response = await fetch(`/api/clinic/patient-photos/${id}`, { method: "DELETE" });
    if (!response.ok) setPhotos(previous);
  }

  return (
    <section className="rounded-[28px] bg-white p-5 shadow-[0_6px_18px_rgba(35,70,55,0.06)]">
      <h2 className="text-base font-extrabold text-brand">عکس‌های پرونده</h2>
      <p className="mt-2 text-sm leading-7 text-muted-foreground">
        یک پرونده چند عکس دارد. با دوربین گوشی بگیرید یا از گالری انتخاب کنید. الان {photos.length} عکس از {RECORD_PHOTO_LIMIT} عکس روی این پرونده است.
      </p>
      <PhotoSourceButtons
        disabled={pending || photos.length >= RECORD_PHOTO_LIMIT}
        onFiles={(files) => void add(files)}
      />
      {error ? <p className="mt-3 text-sm font-medium text-rose-700">{error}</p> : null}
      {photos.length ? (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
          {photos.map((photo, index) => (
            <div key={photo.id} className="relative">
              {/* عکس پرونده از مسیر کارکنان است و بهینه‌ساز تصویر به آن دسترسی ندارد. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/clinic/patient-photos/${photo.id}`}
                alt={`عکس ${index + 1} پرونده`}
                className="h-28 w-full rounded-2xl bg-[#F7F8F6] object-contain"
              />
              <span className="absolute bottom-1 right-1 rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-brand">
                {index + 1}
              </span>
              <button
                type="button"
                aria-label={`حذف عکس ${index + 1}`}
                onClick={() => void remove(photo.id)}
                className="absolute left-1 top-1 inline-flex size-7 items-center justify-center rounded-full bg-white text-brand"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
