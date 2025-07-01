/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["mysql2"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["localhost", "pestournament.ke", "res.cloudinary.com"],
    formats: ["image/webp", "image/avif"],
    unoptimized: true,
  },
  // Disable static optimization for pages that need database access
  generateStaticParams: false,
  // Add environment variable validation
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "PES Tournament Platform",
    NEXT_PUBLIC_COMPANY_NAME: process.env.NEXT_PUBLIC_COMPANY_NAME || "Iguanya Labs",
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ]
  },
  async redirects() {
    return [
      {
        source: "/admin",
        destination: "/dashboard",
        permanent: false,
      },
    ]
  },
  // Handle build-time API route issues
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Don't bundle API routes during build
      config.externals = config.externals || []
      config.externals.push({
        mysql2: "commonjs mysql2",
        resend: "commonjs resend",
        africastalking: "commonjs africastalking",
      })
      // Don't bundle database connections in client-side code
      config.externals.push("mysql2")
    }
    return config
  },
}

module.exports = nextConfig
