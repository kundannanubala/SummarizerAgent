/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/:path*', // Adjust this to your backend URL
      },
      {
        source: '/api/preferred-articles/:path*',
        destination: 'http://localhost:5000/api/preferred-articles/:path*',
      },
    ]
  },
  // Add any other necessary configurations
}

module.exports = nextConfig