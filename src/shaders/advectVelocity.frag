precision highp float;

in vec3 v2f_position;
in vec2 v2f_uv;

uniform int canvasWidth;
uniform int canvasHeight;
const float dt = 0.03;

uniform sampler2D tempSolverTex;
uniform sampler2D tempPrevTex;

layout(location = 0) out vec4 solver;
layout(location = 1) out vec4 prev;

void main() {
    float step_x = 1.0 / float(canvasWidth);
    float step_y = 1.0 / float(canvasHeight);
    
    // int ddx0; 
    // int ddx1;
    // int ddy0;
    // int ddy1;
    // float x;
    // float y;
    // float s0;
    // float t0;
    // float s1;
    // float t1;
    // float dfdt;

    // float dfdt = dt * (float(canvasWidth) + float(canvasHeight)) * 0.5;
    float dfdt = dt;

    vec4 tempSolver = texture(tempSolverTex, v2f_uv);
    vec4 tempPrev = texture(tempPrevTex, v2f_uv);

    //バックトレースポイント割り出し.
    float x = step_x + v2f_uv.x - dfdt * tempSolver.x;
    float y = step_y + v2f_uv.y - dfdt * tempSolver.y;

    //ポイントがシミュレーション範囲内に収まるようにクランプ.
    // x = clamp(x, step_x * 0.5, 1.0 - step_x * 0.5);
    // y = clamp(y, step_y * 0.5, 1.0 - step_y * 0.5);

    //バックトレースポイントの近傍セル割り出し
    float ddx0 = x;//floor(x);
    float ddx1 = ddx0 + step_x;
    float ddy0 = y;//floor(y);
    float ddy1 = ddy0 + step_y;

    //近傍セルとの線形補間用の差分を取っておく.
    float s1 = x - ddx0;
    // float s0 = 1.0 - s1;
    float s0 = step_x - s1;
    float t1 = y - ddy0;
    // float t0 = 1.0 - t1;
    float t0 = step_y - t1;

    vec4 prev0 = texture(tempSolverTex, vec2(ddx0, ddy0));
    vec4 prev1 = texture(tempSolverTex, vec2(ddx1, ddy0));
    vec4 prev2 = texture(tempSolverTex, vec2(ddx0, ddy1));
    vec4 prev3 = texture(tempSolverTex, vec2(ddx1, ddy1));

    //バックトレースし、1step前の値を近傍との線形補間をとって、現在の速度場に代入。
    // vec2 vec = s0 * (t0 * prev0.xy + t1 * prev2.xy) + s1 * (t0 * prev1.xy + t1 * prev3.xy);
    vec2 v1 = mix(prev0.xy, prev2.xy, t1);
    vec2 v2 = mix(prev1.xy, prev3.xy, t1);
    vec2 vel = mix(v1, v2, s1);
    vec4 _solver = vec4(vel.x, vel.y, 0.0, 1.0);
    // SetBoundaryDensity(id, w, h);

    solver = _solver;
    prev = tempPrev;
}