# کلینیک لاغری تندیس یزد

وب‌اپ معرفی و نوبت‌دهی برای کلینیک لاغری تندیس یزد.

## امکانات

- صفحه اصلی فارسی (RTL) با معرفی برند و خدمات
- توضیح روش کار کلینیک
- فرم رزرو نوبت مشاوره با اعتبارسنجی موبایل
- ذخیره درخواست‌های نوبت در `.data/bookings.json` (لوکال)

## اجرا

```bash
npm install
npm run dev -- --port 3847
```

سپس در مرورگر باز کنید: [http://127.0.0.1:3847](http://127.0.0.1:3847)

## اسکریپت‌ها

| دستور | توضیح |
| --- | --- |
| `npm run dev` | سرور توسعه |
| `npm run build` | ساخت نسخه production |
| `npm run start` | اجرای نسخه production |
| `npm run lint` | بررسی ESLint |

## پشته

Next.js (App Router)، TypeScript، Tailwind CSS، shadcn/ui
