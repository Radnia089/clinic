import type { Metadata } from "next";
import { SampleCalm } from "@/components/landing/sample-calm";
import { getAppData } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function CalmPreviewPage() {
  const { clinic } = await getAppData();
  return <SampleCalm clinic={clinic} />;
}
