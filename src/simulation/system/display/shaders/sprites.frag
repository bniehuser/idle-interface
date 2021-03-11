#version 300 es
precision highp float;
in vec2 texPos;
in vec2 spritePos;

uniform float u_time;
uniform vec2 u_offs;
uniform float u_scale;
uniform vec2 u_viewport;
uniform vec3 u_sunDirection;
uniform vec3 u_sunColor;
uniform vec3 u_moonDirection;
uniform vec3 u_moonColor;
uniform sampler2D mapPix;
uniform sampler2D tilePix;
uniform sampler2D spritePix;

out vec4 outColor;

vec3 sunLight(const vec3 surfaceNormal, const vec3 eyeNormal, float shiny, float spec, float diffuse){
    vec3 diffuseColor = max(dot(u_sunDirection, surfaceNormal),0.0)*u_sunColor*diffuse;
    vec3 reflection = normalize(reflect(-u_sunDirection, surfaceNormal));
    float direction = max(0.0, dot(eyeNormal, reflection));
    vec3 specular = pow(direction, shiny)*u_sunColor*spec;
    return diffuseColor + specular;
}

vec3 moonLight(const vec3 surfaceNormal, const vec3 eyeNormal, float shiny, float spec, float diffuse){
    vec3 diffuseColor = max(dot(u_moonDirection, surfaceNormal),0.0)*u_moonColor*diffuse;
    vec3 reflection = normalize(reflect(-u_moonDirection, surfaceNormal));
    float direction = max(0.0, dot(eyeNormal, reflection));
    vec3 specular = pow(direction, shiny)*u_moonColor*spec;
    return diffuseColor + specular;
}

void main() {

    vec2 newPos = spritePos * 512.;
    // pixel pos in 'world space'
    vec2 posP = texPos;

    // reverse calculate screen pos for eyeNormal
    vec2 screenPos = (newPos / u_viewport + u_offs)  / u_scale;

    // fract representation of map location, get map lookup pixel
    vec4 spriteData = texture(spritePix, posP);

    // calc eyeball normal to pixel assuming 1 unit distance
    vec3 eyeNormal = normalize(vec3(screenPos - .5, -1.));
    // get sunlight
    vec4 sl = vec4(sunLight(normalize(vec3(0., 0., -1)), eyeNormal, 15., 2.5 , 1.), 1.); // orig 15., 2.5, 1.
    vec4 ml = vec4(moonLight(normalize(vec3(0., 0., -1)), eyeNormal, 15., 2.5 , 1.), 1.); // orig 15., 2.5, 1.
    ml = u_moonDirection.z > 0. ? vec4(0., 0., 0., 1.) : ml;
    sl = u_sunDirection.z > 0. ? vec4(0., 0., 0., 1.) : sl;
    sl = max(sl, ml);

    // apply sunlight to tile pixel and return
    outColor = vec4(1., 1., 0., 1.); // spriteData * .2 + spriteData * sl;

}
