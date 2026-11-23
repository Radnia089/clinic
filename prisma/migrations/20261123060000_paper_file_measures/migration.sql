-- اطلاعات پرونده کاغذی و اندازه‌های چپ و راست
ALTER TABLE "Patient" ADD COLUMN "education" TEXT;
ALTER TABLE "Patient" ADD COLUMN "maritalStatus" TEXT;
ALTER TABLE "Patient" ADD COLUMN "occupation" TEXT;

ALTER TABLE "Measurement" ADD COLUMN "heightCm" REAL;
ALTER TABLE "Measurement" ADD COLUMN "bmi" REAL;
ALTER TABLE "Measurement" ADD COLUMN "bodyFatPct" REAL;
ALTER TABLE "Measurement" ADD COLUMN "muscleMassKg" REAL;
ALTER TABLE "Measurement" ADD COLUMN "visceralFat" REAL;
ALTER TABLE "Measurement" ADD COLUMN "rmr" REAL;
ALTER TABLE "Measurement" ADD COLUMN "sessionLabel" TEXT;
ALTER TABLE "Measurement" ADD COLUMN "armRightCm" REAL;
ALTER TABLE "Measurement" ADD COLUMN "armLeftCm" REAL;
ALTER TABLE "Measurement" ADD COLUMN "chestCm" REAL;
ALTER TABLE "Measurement" ADD COLUMN "waistBelowCm" REAL;
ALTER TABLE "Measurement" ADD COLUMN "thighRightCm" REAL;
ALTER TABLE "Measurement" ADD COLUMN "thighLeftCm" REAL;
ALTER TABLE "Measurement" ADD COLUMN "kneeRightCm" REAL;
ALTER TABLE "Measurement" ADD COLUMN "kneeLeftCm" REAL;
ALTER TABLE "Measurement" ADD COLUMN "calfRightCm" REAL;
ALTER TABLE "Measurement" ADD COLUMN "calfLeftCm" REAL;
