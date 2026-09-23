import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    // Prints são comprimidos no navegador antes do envio (~300 KB cada),
    // mas deixamos folga para os dois arquivos juntos.
    serverActions: { bodySizeLimit: '4mb' },
  },
  images: { remotePatterns: [{ protocol: 'https', hostname: '**' }] },
};

export default nextConfig;
