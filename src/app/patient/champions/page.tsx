import Link from "next/link";
import Image from "next/image";
import { lostKg, lostSizeCm } from "@/lib/champions";
import { listChampions } from "@/lib/store";

export const dynamic = "force-dynamic";

function faNum(n: number) {
  return new Intl.NumberFormat("fa-IR").format(n);
}

export default async function PatientChampionsPage() {
  const champions = await listChampions({ publishedOnly: true });

  return (
    <div className="mx-auto min-h-[100svh] w-full max-w-[430px] bg-[#F7F8F6] px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-brand">قهرمانان تندیس</h1>
        <Link href="/patient" className="text-sm text-brand">
          بازگشت
        </Link>
      </div>

      <p className="mb-5 text-sm leading-7 text-muted-foreground">
        در تندیس هم کاهش وزن مهم است، هم کاهش سایز — قبل و بعد واقعی را ببینید.
      </p>

      {champions.length === 0 ? (
        <p className="rounded-[1.5rem] bg-white p-6 text-center text-sm text-muted-foreground">
          هنوز قهرمانی منتشر نشده است.
        </p>
      ) : (
        <div className="space-y-4 pb-8">
          {champions.map((champion) => {
            const lost = lostKg(champion);
            const sizeLost = lostSizeCm(champion);
            return (
              <article
                key={champion.id}
                className="overflow-hidden rounded-[1.5rem] bg-white shadow-[0_8px_24px_rgba(35,70,55,0.08)]"
              >
                <div className="relative aspect-[4/5]">
                  <div className="absolute inset-0 grid grid-cols-2">
                    <div className="relative">
                      <Image
                        src={champion.beforeImage}
                        alt={`${champion.name} — قبل`}
                        fill
                        className="object-cover object-top grayscale-[35%]"
                        sizes="215px"
                      />
                      <span className="absolute bottom-3 right-2 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-bold text-white">
                        قبل
                      </span>
                    </div>
                    <div className="relative border-r border-white/40">
                      <Image
                        src={champion.afterImage}
                        alt={`${champion.name} — بعد`}
                        fill
                        className="object-cover object-top"
                        sizes="215px"
                      />
                      <span className="absolute bottom-3 left-2 rounded-full bg-[#14352A]/80 px-2.5 py-1 text-[10px] font-bold text-white">
                        بعد
                      </span>
                    </div>
                  </div>
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 to-transparent" />
                  <div className="absolute inset-x-3 bottom-3 flex flex-wrap items-end justify-center gap-1.5">
                    <span className="rounded-full bg-[#14352A] px-3 py-1.5 text-[11px] font-extrabold text-white">
                      {faNum(lost)} kg وزن
                    </span>
                    {sizeLost !== undefined && sizeLost > 0 ? (
                      <span className="rounded-full bg-[#F0B429] px-3 py-1.5 text-[11px] font-extrabold text-[#14352A]">
                        {faNum(sizeLost)} سم سایز
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="space-y-1.5 p-4">
                  <h2 className="text-base font-extrabold text-brand">
                    {champion.name}
                  </h2>
                  <p className="text-sm leading-7 text-muted-foreground">
                    {champion.quote}
                  </p>
                  <p className="text-xs font-semibold text-brand/80">
                    وزن {faNum(champion.startKg)}→{faNum(champion.endKg)} kg
                    {champion.startWaistCm !== undefined &&
                    champion.endWaistCm !== undefined
                      ? ` · کمر ${faNum(champion.startWaistCm)}→${faNum(champion.endWaistCm)} سم`
                      : ""}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Link
        href="/patient/book"
        className="mb-6 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-cta text-sm font-bold text-cta-foreground"
      >
        من هم شروع می‌کنم
      </Link>
    </div>
  );
}
