precision highp float;

in vec3 v2f_position;
in vec2 v2f_uv;

uniform sampler2D sourceTex;
uniform sampler2D tempSourceTex;
uniform sampler2D tempPrevTex;
uniform int canvasWidth;
uniform int canvasHeight;

layout(location = 0) out vec4 solver;
layout(location = 1) out vec4 prev;

const float dt = 0.03;
const float densityCoef = 30.0;

void main() {
      vec4 source = texture(sourceTex, v2f_uv);
      vec4 tempSource = texture(tempSourceTex, v2f_uv);
      vec4 tempPrev = texture(tempPrevTex, v2f_uv);

      solver = vec4(tempSource.xy, tempSource.z + source.z * densityCoef * dt, 1.0);
      prev = vec4(tempPrev.xy, tempPrev.z * densityCoef * dt, 0.0);
}