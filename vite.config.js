import basicSsl from "@vitejs/plugin-basic-ssl";

module.exports = {
  root: "docs",
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
};
