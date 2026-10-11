import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "اپ مشتری کلینیک تندیس",
    short_name: "تندیس",
    description:
      "اپ مشتری کلینیک رژیم درمانی تندیس یزد — نوبت، پیشرفت و صندوق پیام",
    start_url: "/patient",
    scope: "/",
    display: "standalone",
    background_color: "#F7F8F6",
    theme_color: "#1F5C45",
    lang: "fa",
    dir: "rtl",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
