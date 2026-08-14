import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ZVIDEO — zstudio",
    short_name: "ZVIDEO",
    description: "Quản lý sản xuất video — Zteam/Zudio",
    start_url: "/",
    display: "standalone",
    background_color: "#12141c",
    theme_color: "#12141c",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
