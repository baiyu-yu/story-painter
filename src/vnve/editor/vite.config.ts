import path from "path";
import { defineConfig, splitVendorChunkPlugin, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import legacy from "@vitejs/plugin-legacy";
import http from "node:http";
import https from "node:https";
import { URL } from "node:url";

// Custom proxy plugin for development
const customProxyPlugin = (): Plugin => ({
  name: "custom-proxy-plugin",
  configureServer(server) {
    server.middlewares.use("/api/cors-proxy", (req, res, next) => {
      const urlParams = new URL(req.url!, `http://${req.headers.host}`);
      const targetUrl = urlParams.searchParams.get("url");

      if (!targetUrl) {
        res.statusCode = 400;
        res.end("Missing target url");
        return;
      }

      const target = new URL(targetUrl);
      const protocol = target.protocol === "https:" ? https : http;

      const proxyReq = protocol.request(
        targetUrl,
        {
          method: req.method,
          headers: {
            ...req.headers,
            host: target.host,
            origin: target.origin,
            referer: target.href,
          },
        },
        (proxyRes) => {
          res.writeHead(proxyRes.statusCode!, proxyRes.headers);
          proxyRes.pipe(res);
        }
      );

      proxyReq.on("error", (err) => {
        console.error("Proxy error:", err);
        res.statusCode = 500;
        res.end("Proxy error: " + err.message);
      });

      req.pipe(proxyReq);
    });
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/api/llm/openai": {
        target: "https://api.openai.com/v1",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/llm\/openai/, ""),
      },
      "/api/llm/deepseek": {
        target: "https://api.deepseek.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/llm\/deepseek/, ""),
      },
      "/api/llm/ark": {
        target: "https://ark.cn-beijing.volces.com/api/v3",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/llm\/ark/, ""),
      },
      "/api/tts/ark": {
        target: "https://openspeech.bytedance.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/tts\/ark/, ""),
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@vnve/core": path.resolve(__dirname, "../core/src"),
    },
  },
  plugins: [
    react(),
    legacy({
      targets: ["defaults", "not IE 11"],
    }),
    splitVendorChunkPlugin(),
    customProxyPlugin(),
  ],
});
