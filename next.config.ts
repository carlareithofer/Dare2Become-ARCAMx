import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // permite deschiderea serverului de dezvoltare de pe telefon, din aceeași rețea Wi-Fi
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.*.*.*", "*.local"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
