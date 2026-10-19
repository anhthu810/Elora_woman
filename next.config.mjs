import path from 'path';
import { fileURLToPath } from 'url';
const root = path.dirname(fileURLToPath(import.meta.url));
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { serverActions: { bodySizeLimit: '1mb' }, serverComponentsExternalPackages: ['better-sqlite3'] },
  webpack: (config) => { config.resolve.alias['@'] = root; return config; },
};
export default nextConfig;
