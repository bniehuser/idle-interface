uniform vec3 u_sunDirection;
uniform vec3 u_sunColor;
uniform vec3 u_moonDirection;
uniform vec3 u_moonColor;

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
