import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/iris25/",
  build: {
    // Enable sourcemaps only in development
    sourcemap: process.env.NODE_ENV !== "production",
  },
});