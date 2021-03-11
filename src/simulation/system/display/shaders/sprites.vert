#version 300 es
in vec4 position;
out vec2 texPos;
out vec2 spritePos;

void main() {
    gl_Position = vec4(position.x*2.-1., position.y*2.-1., 1., 1.);
    texPos = position.zw;
    spritePos = position.xy;
}
