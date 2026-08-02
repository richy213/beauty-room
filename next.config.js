/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fix Windows webpack cache rename error
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = { type: "memory" };
    }
    return config;
  },
  images: {
    domains: ["drive.google.com", "lh3.googleusercontent.com", "images.unsplash.com"],
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  // Permite que las imágenes de Drive se muestren sin restricciones
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
