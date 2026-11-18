import type { Metadata } from "next";
import { SampleBright } from "@/components/landing/sample-bright";
import { getAppData } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function BrightPreviewPage() {
  const { clinic } = await getAppData();
  return <SampleBright clinic={clinic} />;
}
