precision highp float;

in vec3 v2f_position;
in vec2 v2f_uv;

const float w = 1104.0;//1024.0;
const float h = 728.0;
const float dt = 0.03;
const int GS_ITERATE = 2;

uniform sampler2D tempSolverTex;
uniform sampler2D tempPrevTex;

layout(location = 0) out vec4 solver;
layout(location = 1) out vec4 prev;

void main() {
    float step_x = 1.0/w;
    float step_y = 1.0/h;
    
    int ddx0; 
    int ddx1;
    int ddy0;
    int ddy1;
    float x;
    float y;
    float s0;
    float t0;
    float s1;
    float t1;
    float dfdt;

    dfdt = dt * (w + h) * 0.5;
    vec4 tempSolver = texture(tempSolverTex, v2f_uv);
    vec4 tempPrev = texture(tempPrevTex, v2f_uv);

    //バックトレースポイント割り出し.
    x = step_x - dfdt * tempSolver.x;
    y = step_y - dfdt * tempSolver.y;

    //ポイントがシミュレーション範囲内に収まるようにクランプ.
    x = clamp(x, 0.5, w + 0.5);
    y = clamp(y, 0.5, h + 0.5);

    //バックトレースポイントの近傍セル割り出し.
    ddx0 = floor(x);
    ddx1 = ddx0 + 1;
    ddy0 = floor(y);
    ddy1 = ddy0 + 1;

    //近傍セルとの線形補間用の差分を取っておく.
    s1 = x - ddx0;
    s0 = 1.0 - s1;
    t1 = y - ddy0;
    t0 = 1.0 - t1;

    //バックトレースし、1step前の値を近傍との線形補間をとって、現在の速度場に代入。
    float dens = s0 * (t0 * prev[int2(ddx0, ddy0)].z + t1 * prev[int2(ddx0, ddy1)].z) +
                    s1 * (t0 * prev[int2(ddx1, ddy0)].z + t1 * prev[int2(ddx1, ddy1)].z);
    SetBoundaryDensity(id, w, h);
}