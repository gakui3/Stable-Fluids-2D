precision highp float;

in vec3 v2f_position;
in vec2 v2f_uv;

uniform sampler2D prevResultTex;
uniform sampler2D solverTex;

layout(location = 0) out vec4 result;

const float dt = 0.03;

void main() {
      vec4 prevResult = texture(prevResultTex, v2f_uv);
      vec4 solver = texture(solverTex, v2f_uv);

      vec2 addUv = v2f_uv + solver.xy * dt;
      result = texture(prevResultTex, addUv);
}