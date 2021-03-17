#version 300 es
precision highp float;
in vec2 texPos;

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

// note: these may be redefined several places, which is Not Good
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
    vec2 newPos = texPos;
    // probably unnecessary
    float x = newPos.x + sin(fract(u_time))*.5;
    float y = newPos.y + sin(fract(u_time))*.5;

    // pixel pos in 'world space'
    vec2 posP = u_scale * (vec2(x, y) * u_viewport - u_offs);
    // tilemap pos (div by tile size)
    vec2 uv = posP / 32.;
    // overstep amount within tile
    vec2 tileOS = floor(mod(posP,32.));

    // ignore if off map
    if(uv.x > 512. || uv.x < 0.) discard;
    if(uv.y > 512. || uv.y < 0.) discard;

    // fract representation of map location, get map lookup pixel
    vec2 uvP = uv/512.;
    vec4 tileData = texture(mapPix, uvP);
    // convert frac value of color back to pixel value
    vec2 tileDP = floor(tileData.rg * 255.);

    // get pixel pos in tilemap, convert to frac for uv map
    vec2 tileL = tileDP + tileOS;
    vec4 tileP = texture(tilePix, tileL/vec2(384., 512.));

    // calc eyeball normal to pixel assuming 1 unit distance
    vec3 eyeNormal = normalize(vec3(newPos - .5, 0.) - vec3(0.,0.,-1.));
    // get sunlight
    float gs = (tileP.r + tileP.g + tileP.b) / 3.;
    float shiny = gs * 25.;
    float diff = gs * 3.5;
    vec4 sl = vec4(sunLight(normalize(vec3(0., 0., -1)), eyeNormal, shiny, diff, 1.), 1.); // orig 15., 2.5, 1.
    vec4 ml = vec4(moonLight(normalize(vec3(0., 0., -1)), eyeNormal, shiny, diff, 1.), 1.); // orig 15., 2.5, 1.
    ml = u_moonDirection.z > 0. ? vec4(0., 0., 0., 1.) : ml;
    sl = u_sunDirection.z > 0. ? vec4(0., 0., 0., 1.) : sl;
    sl = max(sl, ml);

    // apply sunlight to tile pixel and return
    outColor = tileP * .2 + tileP * sl;

    vec2 scrP = (newPos*2.-1.);
    // if(abs(scrP.x) < .001 || abs(scrP.y) < .001) {
    //   outColor = vec4(1.,0.,0.,1.);
    // }
    vec3 mdOffs = u_moonDirection;
    // sdOffs.z += 1.;
    if(length(mdOffs.xz - scrP) < .005) {
        outColor = vec4(u_moonColor, 1);
    }
    vec3 sdOffs = u_sunDirection;
    // sdOffs.z += 1.;
    if(length(sdOffs.xz - scrP) < .01) {
        outColor = vec4(u_sunColor, 1);
    }
}
