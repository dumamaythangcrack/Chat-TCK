/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@tck/ui",
    "@tck/design-system",
    "@tck/shared",
    "@tck/types",
    "@tck/i18n",
    "@tck/database",
    "@tck/ai",
    "@tck/security",
    "@tck/realtime",
    "@tck/media",
    "@tck/recommendation",
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default nextConfig;
