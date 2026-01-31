import type { NextConfig } from "next";

// Supabase Storage host for route images (set NEXT_PUBLIC_SUPABASE_URL so next/image works for route images)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHost =
  typeof supabaseUrl === "string" && supabaseUrl.startsWith("http")
    ? new URL(supabaseUrl).hostname
    : null;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "via.placeholder.com", pathname: "/**" },
      ...(supabaseHost
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHost,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
    formats: ["image/webp", "image/avif"],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
  },
};

export default nextConfig;
