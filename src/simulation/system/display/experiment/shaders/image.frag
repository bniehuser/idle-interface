#version 300 es
precision mediump float;

in vec2 vTextureCoord;
out vec4 vFragColor;

uniform sampler2D uSampler;
uniform float uAlpha;
uniform vec4 uTransparentColor;

void main()
{
    vec4 color = texture(uSampler, vTextureCoord);

    if (uTransparentColor.a == 1.0 && uTransparentColor.rgb == color.rgb)
    discard;

    vFragColor = vec4(color.rgb, color.a * uAlpha);
}
