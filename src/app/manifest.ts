import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "أحمد داود — رولمان البلي",
    short_name: "أحمد داود",
    description: "متخصصون في استيراد وتوريد جميع أنواع ومقاسات الرولمان البلي الأصلي بجميع الماركات العالمية.",
    start_url: "/ar",
    display: "standalone",
    background_color: "#F4F6F8",
    theme_color: "#1d4ed8",
    orientation: "portrait",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
