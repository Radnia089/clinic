# اپ اندروید مشتری تندیس

نسخهٔ اندروید اپ مشتری — همان تجربهٔ وب `/patient` داخل WebView تمام‌صفحه.

- نام اپ: **تندیس**
- پکیج: `ir.tandisclinicyazd.patient`
- آدرس پیش‌فرض: `https://tandisclinicyazd.ir/patient`

نسخه‌ای که از لندینگ دانلود می‌شود این فایل است: `public/downloads/tandis-patient.apk`.

## ساخت APK

```bash
cd android-patient
./gradlew assembleRelease   # یا assembleDebug
```

خروجی:

- Debug: `app/build/outputs/apk/debug/app-debug.apk`
- Release: `app/build/outputs/apk/release/app-release-unsigned.apk`

برای تغییر آدرس سرور، مقدار `PATIENT_APP_URL` را در `app/build.gradle.kts` ویرایش کنید.
