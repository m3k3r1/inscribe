/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'github.com' },
      { hostname: 'i3.ytimg.com' },
      { hostname: 'avatars.githubusercontent.com' },
    ],
  },
  experimental: {
    instrumentationHook: true,
    // reactCompiler: true,
  },
}

export default nextConfig
