precision highp float;

in vec3 v2f_position;
in vec2 v2f_uv;

uniform sampler2D srcTex;

layout(location = 0) out vec4 prevResult;

void main() {
      vec4 src = texture(srcTex, v2f_uv);
      prevResult = src;
}