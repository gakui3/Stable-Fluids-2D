precision highp float;

in vec3 v2f_position;
in vec2 v2f_uv;

const float dt = 0.03;
const float visc = 3.0;
const int GS_ITERATE = 2;

uniform sampler2D tempSolverTex;
uniform sampler2D tempPrevTex;
uniform int canvasWidth;
uniform int canvasHeight;

layout(location = 0) out vec4 solver;
layout(location = 1) out vec4 prev;

void main() {
    float step_x = 1.0/float(canvasWidth);
    float step_y = 1.0/float(canvasHeight);
    vec4 tempSolver = texture(tempSolverTex, v2f_uv);
    vec4 tempSolver_left = texture(tempSolverTex, vec2(v2f_uv.x - step_x, v2f_uv.y));
    vec4 tempSolver_right = texture(tempSolverTex, vec2(v2f_uv.x + step_x, v2f_uv.y));
    vec4 tempSolver_up = texture(tempSolverTex, vec2(v2f_uv.x, v2f_uv.y + step_y));
    vec4 tempSolver_down = texture(tempSolverTex, vec2(v2f_uv.x, v2f_uv.y - step_y));

    vec4 tempPrev = texture(tempPrevTex, v2f_uv);
    float a = dt * visc * float(canvasWidth) * float(canvasHeight);

    vec4 v = vec4(0.0, 0.0, 0.0, 1.0);
    for (int k = 0; k < GS_ITERATE; k++) {
        v = vec4(tempSolver.xy, tempPrev.z + a * (tempSolver_left.z + tempSolver_right.z + tempSolver_down.z + tempSolver_up.z) / (1.0 + 4.0 * a), 1.0);
        // SetBoundaryVelocity(id, w, h);
    }
    v.a = 1.0;
    solver = v;
    prev = tempPrev;
}