import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getAppData, updateClinic } from "@/lib/store";
import { DEFAULT_CLINIC_ABOUT, type ClinicAbout } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const { clinic } = await getAppData();
  return NextResponse.json({
    clinic: {
      name: clinic.name,
      fullName: clinic.fullName,
      tagline: clinic.tagline,
      phone: clinic.phone,
      address: clinic.address,
      hours: clinic.hours,
      about: clinic.about ?? DEFAULT_CLINIC_ABOUT,
    },
  });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "management") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const aboutPatch = (body.about ?? body) as Partial<ClinicAbout>;

  const about: ClinicAbout = {
    aboutText: String(aboutPatch.aboutText ?? "").trim(),
    doctorName: String(aboutPatch.doctorName ?? "").trim(),
    doctorTitle: String(aboutPatch.doctorTitle ?? "").trim(),
    doctorBio: String(aboutPatch.doctorBio ?? "").trim(),
    doctorImage: String(aboutPatch.doctorImage ?? "").trim() || undefined,
    coverImage: String(aboutPatch.coverImage ?? "").trim() || undefined,
    gallery: Array.isArray(aboutPatch.gallery)
      ? aboutPatch.gallery.map((u) => String(u).trim()).filter(Boolean).slice(0, 8)
      : [],
    mapUrl: String(aboutPatch.mapUrl ?? "").trim() || undefined,
  };

  if (!about.aboutText || !about.doctorName) {
    return NextResponse.json({ error: "validation_failed" }, { status: 400 });
  }

  const clinicPatch: {
    about: ClinicAbout;
    phone?: string;
    address?: string;
    hours?: string;
    fullName?: string;
    tagline?: string;
  } = { about };

  if (body.phone !== undefined) {
    clinicPatch.phone = String(body.phone).trim();
  }
  if (body.address !== undefined) {
    clinicPatch.address = String(body.address).trim();
  }
  if (body.hours !== undefined) {
    clinicPatch.hours = String(body.hours).trim();
  }
  if (body.fullName !== undefined) {
    clinicPatch.fullName = String(body.fullName).trim();
  }
  if (body.tagline !== undefined) {
    clinicPatch.tagline = String(body.tagline).trim();
  }

  const clinic = await updateClinic(clinicPatch);
  return NextResponse.json({ clinic });
}
