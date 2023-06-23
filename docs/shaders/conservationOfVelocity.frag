precision highp float;

in vec3 v2f_position;
in vec2 v2f_uv;

uniform sampler2D tempSolverTex;
uniform sampler2D tempPrevTex;

uniform int canvasWidth;
uniform int canvasHeight;

layout(location = 0) out vec4 solver;
layout(location = 1) out vec4 prev;

const float dt = 0.03;

void main() {
    float step_x = 1.0 / float(canvasWidth);
    float step_y = 1.0 / float(canvasHeight);
    vec4 tempPrev = texture(tempPrevTex, v2f_uv);
    vec4 tempPrev_left = texture(tempPrevTex, vec2(v2f_uv.x - step_x, v2f_uv.y));
    vec4 tempPrev_right = texture(tempPrevTex, vec2(v2f_uv.x + step_x, v2f_uv.y));
    vec4 tempPrev_up = texture(tempPrevTex, vec2(v2f_uv.x, v2f_uv.y + step_y));
    vec4 tempPrev_down = texture(tempPrevTex, vec2(v2f_uv.x, v2f_uv.y - step_y));

    vec4 tempSolver = texture(tempSolverTex, v2f_uv);


    // float velX = tempSolver.x;
    // float velY = tempSolver.y;

    float velX = tempSolver.x - (step_x / 2.0 * (tempPrev_right.x - tempPrev_left.x) );
    float velY = tempSolver.y - (step_y / 2.0 * (tempPrev_up.x - tempPrev_down.x) );

    // velX -= 1.0 / (2.0 * step_x) * (tempPrev_right.x - tempPrev_left.x) / step_x;
    // velY -= 1.0 / (2.0 * step_y) * (tempPrev_up.x - tempPrev_down.x) / step_y;

    solver = vec4(velX, velY, 0.0, tempSolver.w);
    prev = tempPrev;
    // SetBoundaryVelocity(id, w, h);
}