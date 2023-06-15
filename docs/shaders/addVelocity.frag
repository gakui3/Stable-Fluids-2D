#include <common>

varying vec3 v2f_position;
varying vec2 v2f_uv;

void main() {
      float dist = distance(v2f_uv, vec2(0.5, 0.5));
      vec2 vel = vec2(0.0, 0.0);

      if(dist < 0.01){
            vel = vec2(1.0, 1.0);
      }

      gl_FragColor = vec4(vel.x, vel.y, 0.0, 1.0);
}