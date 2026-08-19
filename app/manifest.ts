import type { MetadataRoute } from "next";

// PWA manifest (item 2), served at /manifest.webmanifest. Colors match the
// brand palette in app/globals.css (--color-terracotta-from/-to).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tropa da Lari",
    short_name: "Tropa da Lari",
    description: "Monte e envie fichas de treino personalizadas para seus alunos.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f3fd",
    theme_color: "#4c3a9e",
    orientation: "portrait",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
