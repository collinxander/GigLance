/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    domains: [
      'images.unsplash.com', 
      'lh3.googleusercontent.com',
      'gzdezyfnxtekbnuokgpg.supabase.co',
      'gzdezyfnxtekbnuokgpg.supabase.in'
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Use standalone output for optimized Vercel deployment
  output: 'standalone',
}

module.exports = nextConfig 