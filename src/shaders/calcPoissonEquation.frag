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
    float step_x = 1.0/float(canvasWidth);
    float step_y = 1.0/float(canvasHeight);
    vec4 tempPrev = texture(tempPrevTex, v2f_uv);
    vec4 tempPrev_left = texture(tempPrevTex, vec2(v2f_uv.x - step_x, v2f_uv.y));
    vec4 tempPrev_right = texture(tempPrevTex, vec2(v2f_uv.x + step_x, v2f_uv.y));
    vec4 tempPrev_up = texture(tempPrevTex, vec2(v2f_uv.x, v2f_uv.y + step_y));
    vec4 tempPrev_down = texture(tempPrevTex, vec2(v2f_uv.x, v2f_uv.y - step_y));

    // vec4 _prev = vec4(0.0, 0.0, 0.0, 1.0);
    // for (int k = 0; k < GS_ITERATE; k++)
    // {
    vec4 _prev = vec4((tempPrev.y + tempPrev_left.x + tempPrev_right.x + tempPrev_down.x + tempPrev_up.x) / 4.0, tempPrev.yz, 1.0);
        // SetBoundaryDivPositive(id, w, h);
    // }
    
    solver = texture(tempSolverTex, v2f_uv);
    prev = _prev;
}