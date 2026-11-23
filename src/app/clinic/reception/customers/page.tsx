import { CustomersList } from "@/components/clinic/customers-list";
import { requireStaffPage } from "@/lib/auth";
import { toPublicPatient } from "@/lib/patient-public";
import { listPatients } from "@/lib/store";

export default async function CustomersPage() {
  const user = await requireStaffPage();
  const patients = (await listPatients()).map(toPublicPatient);
  return (
    <CustomersList
      patients={patients}
      canDelete={user.role === "management"}
    />
  );
}
