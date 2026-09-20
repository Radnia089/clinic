import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "کلینیک لاغری تندیس یزد | کاهش وزن علمی و مراقبت شخصی",
  description:
    "کلینیک لاغری تندیس یزد — برنامه‌های تخصصی کاهش وزن، تغذیه درمانی و مراقبت بدنی با پیگیری مستمر در یزد.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fa" dir="rtl" className={`${vazirmatn.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
