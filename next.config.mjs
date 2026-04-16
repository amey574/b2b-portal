/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // Determine backend URL (fallback to localhost for local dev)
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
    
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`, // Proxy to Backend
      },
    ]
  },
};

export default nextConfig;
