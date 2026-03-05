import { execSync } from "node:child_process"
import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const buildVersion = (() => {
  try {
    return execSync("git rev-parse --short HEAD").toString().trim()
  } catch {
    return new Date().toISOString()
  }
})()

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(buildVersion),
  },
  plugins: [
    react(),
    {
      name: "app-version-manifest",
      generateBundle() {
        this.emitFile({
          type: "asset",
          fileName: "version.json",
          source: JSON.stringify(
            {
              version: buildVersion,
              builtAt: new Date().toISOString(),
            },
            null,
            2
          ),
        })
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
