import type { PromoBanner } from "@/lib/types";

export type { PromoBanner };

export function sortPromoBanners(items: PromoBanner[]) {
  return [...items].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function defaultPromoBanners(): PromoBanner[] {
  const now = new Date().toISOString();
  return [
    {
      id: "promo-winter",
      title: "جشنواره تخفیف زمستانه",
      subtitle: "شروع رژیم با تخفیف ویژه پکیج‌های لاغری",
      image: "/images/promos/promo-winter.jpg",
      href: "/patient/book",
      published: true,
      sortOrder: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "promo-installment",
      title: "جشنواره اقساطی تندیس",
      subtitle: "پرداخت آسان اقساطی برای مسیر لاغری",
      image: "/images/promos/promo-installment.jpg",
      href: "/patient/consult",
      published: true,
      sortOrder: 2,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "promo-spring",
      title: "پکیج فرم‌دهی بهاره",
      subtitle: "رژیم + دستگاه‌های کمک لاغری با شرایط ویژه",
      image: "/images/promos/promo-spring.jpg",
      href: "/patient/book",
      published: true,
      sortOrder: 3,
      createdAt: now,
      updatedAt: now,
    },
  ];
}
