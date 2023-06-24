import basicSsl from "@vitejs/plugin-basic-ssl";

module.exports = {
  // root: "src",
  plugins: [basicSsl()],
  server: {
    https: true,
  },
  preview: {
    https: true,
  },
  assetsInclude: [
    "**/*.glb",
    "**/*.gltf",
    "**/*.fbx",
    "**/*.mp4",
    "**/*.webp",
    "**/*.png",
    "**/*.jpg",
  ],
  build: {
    outDir: "docs",
  },
  base: "/Stable-Fluids-2D/",
};
