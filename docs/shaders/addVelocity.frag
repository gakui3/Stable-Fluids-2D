precision highp float;

in vec3 v2f_position;
in vec2 v2f_uv;

uniform sampler2D sourceTex;

layout(location = 0) out vec4 velocity;
layout(location = 1) out vec4 prev;

const float dt = 0.03;
const float velocityCoef = 0.02;

void main() {
      vec4 source = texture(sourceTex, v2f_uv);
      velocity = vec4(source.xy * velocityCoef, 0.0, 1.0);
      // prev = vec4(source.xy * velocityCoef * dt, 0.0, 0.0);
      // velocity = vec4(1.0, 0.0, 0.0, 1.0);
      prev = vec4(1.0, 0.0, 0.0, 1.0);
}