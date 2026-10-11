import type { Metadata } from "next";
import { Playfair_Display, Vazirmatn } from "next/font/google";
import "./globals.css";

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic", "latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "کلینیک لاغری تندیس یزد | رژیم درمانی و مشاوره آنلاین",
  description:
    "کلینیک رژیم درمانی و لاغری تندیس در یزد — رزرو نوبت حضوری، مشاوره آنلاین، برنامه غذایی شخصی و پیگیری کاهش وزن.",
  applicationName: "تندیس",
  appleWebApp: {
    capable: true,
    title: "تندیس",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/tandis-logo.png" },
    ],
    apple: "/icon-192.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${vazirmatn.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
