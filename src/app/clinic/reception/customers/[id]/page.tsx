import { notFound } from "next/navigation";
import { CustomerFileClient } from "@/components/clinic/customer-file-client";
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
  const { id } = await params;
  const patient = await getPatient(id);
  if (!patient) notFound();

  const [visits, measurements, payments] = await Promise.all([
    listVisits(),
    listMeasurements(id),
    listPayments(),
  ]);

  const patientVisits = visits.filter((v) => v.patientId === id);
  const patientPayments = payments.filter((p) => p.patientId === id);

  return (
    <CustomerFileClient
      patient={patient}
      initialVisits={patientVisits}
      measurements={measurements}
      payments={patientPayments}
    />
  );
}
