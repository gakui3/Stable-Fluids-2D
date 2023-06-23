import basicSsl from "@vitejs/plugin-basic-ssl";

module.exports = {
  // root: "src",
  plugins: [basicSsl()],
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
};
