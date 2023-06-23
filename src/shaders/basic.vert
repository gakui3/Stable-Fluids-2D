in vec3 position;
in vec2 uv;

out vec3 v2f_position;
out vec2 v2f_uv;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

void main() {
      v2f_position = position;
      v2f_uv = uv;
      vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
      vec4 mvPosition =  viewMatrix * worldPosition;
      gl_Position = projectionMatrix * mvPosition;
}