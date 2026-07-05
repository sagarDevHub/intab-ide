// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   eslint: {
//     // Allows production builds to successfully complete even if your project has ESLint errors
//     ignoreDuringBuilds: true,
//   },
//   typescript: {
//     // Allows production builds to successfully complete even if your project has strict type errors
//     ignoreBuildErrors: true,
//   },
//   images: {
//     remotePatterns: [
//       {
//         protocol: 'https',
//         hostname: '*',
//         port: '',
//         pathname: '/**',
//       },
//     ],
//   },
//   async headers() {
//     return [
//       {
//         source: '/:path*',
//         headers: [
//           {
//             key: 'Cross-Origin-Opener-Policy',
//             value: 'same-origin',
//           },
//           {
//             key: 'Cross-Origin-Embedder-Policy',
//             value: 'require-corp',
//           },
//         ],
//       },
//     ];
//   },
// };

// module.exports = nextConfig;

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    // Keep this to allow builds despite strict type warnings
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
