/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // GitHub Pages에서 리포지토리 이름이 mysc-training이 아니면 아래 basePath를 수정하세요
  // basePath: '/mysc-training',
  // assetPrefix: '/mysc-training',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
