#include <common>

varying vec3 v2f_position;
varying vec2 v2f_uv;

const int w = 1024;
const int h = 1024;
const float dt = 0.03;
const float vist = 0.01;
const GS_ITERATE = 4;

void main() {
    float a = dt * visc * w * h;

    for (int k = 0; k < GS_ITERATE; k++) {
        velocity[id] = (prev[id].xy + a * (velocity[int2(id.x - 1, id.y)] + velocity[int2(id.x + 1, id.y)] + velocity[int2(id.x, id.y - 1)] + velocity[int2(id.x, id.y + 1)])) / (1 + 4 * a);
        SetBoundaryVelocity(id, w, h);
    }
}