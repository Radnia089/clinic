"use client";

import { clinicTelephone } from "@/lib/site-seo";

export function PhoneLink({
  phone,
  className,
  children,
}: {
  phone: string;
  className?: string;
  children: React.ReactNode;
}) {
  const tel = `tel:${clinicTelephone(phone)}`;
  return (
    <a
      href={tel}
      className={className}
      onClick={(event) => {
        const canCall = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
        if (canCall) return;
        event.preventDefault();
        document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }}
    >
      {children}
    </a>
  );
}
