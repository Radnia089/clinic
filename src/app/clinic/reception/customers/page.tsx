import { CustomersList } from "@/components/clinic/customers-list";
import { listPatients } from "@/lib/store";

export default async function CustomersPage() {
  const patients = await listPatients();
  return <CustomersList patients={patients} />;
}
