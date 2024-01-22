/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: {
            allowedOrigins: ["june4432.ipdisk.co.kr:3200", "localhost:3200", "leeyoungjun.duckdns.org"]
        }
    }
}
module.exports = nextConfig;
