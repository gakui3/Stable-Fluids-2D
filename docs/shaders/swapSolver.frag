precision highp float;

in vec3 v2f_position;
in vec2 v2f_uv;

uniform sampler2D sourceTex;
uniform sampler2D prevTex;

layout(location = 0) out vec4 tempSolver;
layout(location = 1) out vec4 tempPrev;

void main() {
    vec4 source = texture(sourceTex, v2f_uv);
    vec4 prev = texture(prevTex, v2f_uv);

    tempSolver = source;
    tempPrev = prev;
}