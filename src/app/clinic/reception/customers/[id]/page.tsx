import { notFound } from "next/navigation";
import { CustomerFileClient } from "@/components/clinic/customer-file-client";
import { requireStaffPage } from "@/lib/auth";
import { toPublicPatient } from "@/lib/patient-public";
import { listRecordPhotos } from "@/lib/record-photos";
import {
  getPatient,
  listMeasurements,
  listPayments,
  listVisits,
} from "@/lib/store";

export default async function CustomerFilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaffPage();
  const { id } = await params;
  const patient = await getPatient(id);
  if (!patient) notFound();

  const [visits, measurements, payments, recordPhotos] = await Promise.all([
    listVisits(),
    listMeasurements(id),
    listPayments(),
    listRecordPhotos(id),
  ]);

  const patientVisits = visits.filter((v) => v.patientId === id);
  const patientPayments = payments.filter((p) => p.patientId === id);

  return (
    <CustomerFileClient
      patient={toPublicPatient(patient)}
      initialVisits={patientVisits}
      measurements={measurements}
      payments={patientPayments}
      recordPhotos={recordPhotos}
    />
  );
}
