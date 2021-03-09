#version 300 es
in vec4 position;
out vec2 texPos;

void main() {
    gl_Position = vec4(position.x, position.y, 1, 1);
    texPos = position.zw;
}
