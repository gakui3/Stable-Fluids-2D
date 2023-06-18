precision highp float;

in vec3 v2f_position;
in vec2 v2f_uv;

uniform vec4 source;
uniform float radius;

layout(location = 0) out vec4 value;

void main() {
    vec2 dpdt = (v2f_uv.xy - source.zw) / radius;
	vec4 c = vec4(source.xy * clamp(1.0 - dot(dpdt, dpdt), 0.0, 1.0), clamp(1.0 - dot(dpdt, dpdt), 0.0, 1.0), 0.0);

    value = c;
}