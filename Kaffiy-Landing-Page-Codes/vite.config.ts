import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), "");

  return {
    server: {
      host: env.VITE_HOST || "0.0.0.0",
      port: parseInt(env.VITE_PORT || "3000"),
      strictPort: false,
      open: false,
    },
    preview: {
      host: env.VITE_PREVIEW_HOST || "0.0.0.0",
      port: parseInt(env.VITE_PREVIEW_PORT || "3000"),
      strictPort: true,
      allowedHosts: env.VITE_ALLOWED_HOSTS
        ? env.VITE_ALLOWED_HOSTS.split(",").map((h) => h.trim())
        : ["localhost", "kaffiy.com"],
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, "index.html"),
        },
      },
    },
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    },
  };
});
