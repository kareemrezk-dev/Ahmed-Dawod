/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    // Static export — no server-side image optimization available.
    // All images served as-is from /public.
    unoptimized: true,
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

module.exports = nextConfig;
