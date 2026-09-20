import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero";
import { Services } from "@/components/services";
import { Approach } from "@/components/approach";
import { BookingForm } from "@/components/booking-form";
import { SiteFooter } from "@/components/site-footer";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Services />
        <Approach />
        <BookingForm />
      </main>
      <SiteFooter />
    </>
  );
}
