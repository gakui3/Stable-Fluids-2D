precision highp float;

in vec3 v2f_position;
in vec2 v2f_uv;

const float w = 1104.0;//1024.0;
const float h = 728.0;
const float dt = 0.03;
const float visc = 1.0;
const int GS_ITERATE = 4;

uniform sampler2D tempSolverTex;
uniform sampler2D tempPrevTex;

layout(location = 0) out vec4 solver;
layout(location = 1) out vec4 prev;

void main() {
    float step_x = 1.0/w;
    float step_y = 1.0/h;
    vec4 tempVelocity = texture(tempSolverTex, v2f_uv);
    vec4 tempVelocity_left = texture(tempSolverTex, vec2(v2f_uv.x - step_x, v2f_uv.y));
    vec4 tempVelocity_right = texture(tempSolverTex, vec2(v2f_uv.x + step_x, v2f_uv.y));
    vec4 tempVelocity_up = texture(tempSolverTex, vec2(v2f_uv.x, v2f_uv.y + step_y));
    vec4 tempVelocity_down = texture(tempSolverTex, vec2(v2f_uv.x, v2f_uv.y - step_y));

    vec4 tempPrev = texture(tempPrevTex, v2f_uv);
    float a = dt * visc * w * h;

    vec4 v = vec4(0.0, 0.0, 0.0, 1.0);
    for (int k = 0; k < GS_ITERATE; k++) {
        v = vec4(tempPrev + vec4(a) * (tempVelocity_left + tempVelocity_right + tempVelocity_down + tempVelocity_up)) / (1.0 + 4.0 * a);
        // SetBoundaryVelocity(id, w, h);
    }
    // v.a = 1.0;
    solver = v;
    prev = tempPrev;
}