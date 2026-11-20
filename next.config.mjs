/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["ffmpeg-for-homebridge"],
  outputFileTracingIncludes: {
    "/api/**": ["./node_modules/ffmpeg-for-homebridge/ffmpeg", "./node_modules/ffmpeg-for-homebridge/ffmpeg.exe"],
  },
};

export default nextConfig;
