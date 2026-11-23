-- تاریخ چک برای پرداخت‌هایی که روششان چک است
ALTER TABLE "Payment" ADD COLUMN "checkDate" TEXT;
