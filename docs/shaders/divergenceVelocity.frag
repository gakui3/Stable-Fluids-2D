precision highp float;

in vec3 v2f_position;
in vec2 v2f_uv;

uniform sampler2D tempSolverTex;
uniform sampler2D tempPrevTex;

const float w = 1104.0;
const float h = 728.0;

layout(location = 0) out vec4 solver;
layout(location = 1) out vec4 prev;

const float dt = 0.03;

void main() {
    float step_x = 1.0/w;
    float step_y = 1.0/h;
    vec4 tempSolver = texture(tempSolverTex, v2f_uv);
    vec4 tempSolver_left = texture(tempSolverTex, vec2(v2f_uv.x - step_x, v2f_uv.y));
    vec4 tempSolver_right = texture(tempSolverTex, vec2(v2f_uv.x + step_x, v2f_uv.y));
    vec4 tempSolver_up = texture(tempSolverTex, vec2(v2f_uv.x, v2f_uv.y + step_y));
    vec4 tempSolver_down = texture(tempSolverTex, vec2(v2f_uv.x, v2f_uv.y - step_y));

    prev = vec4(0.0,
                -0.5 * (step_x * tempSolver_right.x - tempSolver_left.x) +
                (step_y * tempSolver_up.y - tempSolver_down.y),
                tempSolver.z, 1.0);
    // prev = vec4(0.0,
    //             -1.0 / (2.0 * step_x) * (step_x * tempSolver_right.x - tempSolver_left.x) +
    //             (step_y * tempSolver_up.y - tempSolver_down.y),
    //             tempSolver.z, 1.0);

    solver = tempSolver;
    
    // SetBoundaryDivergence(id, w, h);
    // SetBoundaryDivPositive(id, w, h);
}