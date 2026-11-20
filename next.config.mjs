/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["ffmpeg-static"],
  outputFileTracingIncludes: {
    "/api/**": ["./node_modules/ffmpeg-static/ffmpeg", "./node_modules/ffmpeg-static/ffmpeg.exe"],
  },
};

export default nextConfig;
