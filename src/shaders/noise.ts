const vertexShader = `
    varying vec2 vUv;

    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

    }
`;

const fragmentShader = `
#ifdef GL_ES
precision mediump float;
#endif

uniform float uTime;
uniform float uLoopDuration;

uniform vec3 uColor1;
uniform vec3 uColor2; 
uniform vec3 uColors[8]; // Array of up to 8 colors
uniform int uNumStops;   // Number of color stops to use

uniform float uWarpScale;
uniform float uGrainAmount;
uniform float uSmoothing;
uniform float uNoiseColor;
uniform float uNoiseScale;
uniform int uFBMOctaves;
uniform float uFBMPersistence;

varying vec2 vUv;

// === Lygia ===

float mod289(const in float x) { return x - floor(x * (1. / 289.)) * 289.; }
vec2 mod289(const in vec2 x) { return x - floor(x * (1. / 289.)) * 289.; }
vec3 mod289(const in vec3 x) { return x - floor(x * (1. / 289.)) * 289.; }
vec4 mod289(const in vec4 x) { return x - floor(x * (1. / 289.)) * 289.; }
 
float permute(const in float v) { return mod289(((v * 34.0) + 1.0) * v); }
vec2 permute(const in vec2 v) { return mod289(((v * 34.0) + 1.0) * v); }
vec3 permute(const in vec3 v) { return mod289(((v * 34.0) + 1.0) * v); }
vec4 permute(const in vec4 v) { return mod289(((v * 34.0) + 1.0) * v); } 

float taylorInvSqrt(in float r) { return 1.79284291400159 - 0.85373472095314 * r; }
vec2 taylorInvSqrt(in vec2 r) { return 1.79284291400159 - 0.85373472095314 * r; }
vec3 taylorInvSqrt(in vec3 r) { return 1.79284291400159 - 0.85373472095314 * r; }
vec4 taylorInvSqrt(in vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float random(vec2 st) { 
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

vec3 randomColor(vec2 st) {
    return vec3(
        random(st),
        random(st + 1.0),
        random(st + 2.0)
    );
}

vec4 grad4(float j, vec4 ip) {
    const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
    vec4 p,s;
    p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
    p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
    s = vec4(lessThan(p, vec4(0.0)));
    p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www;
    return p;
}


// === Noise ===
float snoise(in vec4 v) {
    const vec4  C = vec4( 0.138196601125011,  // (5 - sqrt(5))/20  G4
                        0.276393202250021,  // 2 * G4
                        0.414589803375032,  // 3 * G4
                        -0.447213595499958); // -1 + 4 * G4

    // First corner
    vec4 i  = floor(v + dot(v, vec4(.309016994374947451)) ); // (sqrt(5) - 1)/4
    vec4 x0 = v -   i + dot(i, C.xxxx);

    // Other corners

    // Rank sorting originally contributed by Bill Licea-Kane, AMD (formerly ATI)
    vec4 i0;
    vec3 isX = step( x0.yzw, x0.xxx );
    vec3 isYZ = step( x0.zww, x0.yyz );
    //  i0.x = dot( isX, vec3( 1.0 ) );
    i0.x = isX.x + isX.y + isX.z;
    i0.yzw = 1.0 - isX;
    //  i0.y += dot( isYZ.xy, vec2( 1.0 ) );
    i0.y += isYZ.x + isYZ.y;
    i0.zw += 1.0 - isYZ.xy;
    i0.z += isYZ.z;
    i0.w += 1.0 - isYZ.z;

    // i0 now contains the unique values 0,1,2,3 in each channel
    vec4 i3 = clamp( i0, 0.0, 1.0 );
    vec4 i2 = clamp( i0-1.0, 0.0, 1.0 );
    vec4 i1 = clamp( i0-2.0, 0.0, 1.0 );

    //  x0 = x0 - 0.0 + 0.0 * C.xxxx
    //  x1 = x0 - i1  + 1.0 * C.xxxx
    //  x2 = x0 - i2  + 2.0 * C.xxxx
    //  x3 = x0 - i3  + 3.0 * C.xxxx
    //  x4 = x0 - 1.0 + 4.0 * C.xxxx
    vec4 x1 = x0 - i1 + C.xxxx;
    vec4 x2 = x0 - i2 + C.yyyy;
    vec4 x3 = x0 - i3 + C.zzzz;
    vec4 x4 = x0 + C.wwww;

    // Permutations
    i = mod289(i);
    float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x);
    vec4 j1 = permute( permute( permute( permute (
                i.w + vec4(i1.w, i2.w, i3.w, 1.0 ))
            + i.z + vec4(i1.z, i2.z, i3.z, 1.0 ))
            + i.y + vec4(i1.y, i2.y, i3.y, 1.0 ))
            + i.x + vec4(i1.x, i2.x, i3.x, 1.0 ));

    // Gradients: 7x7x6 points over a cube, mapped onto a 4-cross polytope
    // 7*7*6 = 294, which is close to the ring size 17*17 = 289.
    vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0) ;

    vec4 p0 = grad4(j0,   ip);
    vec4 p1 = grad4(j1.x, ip);
    vec4 p2 = grad4(j1.y, ip);
    vec4 p3 = grad4(j1.z, ip);
    vec4 p4 = grad4(j1.w, ip);

    // Normalise gradients
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    p4 *= taylorInvSqrt(dot(p4,p4));

    // Mix contributions from the five corners
    vec3 m0 = max(0.6 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);
    vec2 m1 = max(0.6 - vec2(dot(x3,x3), dot(x4,x4)            ), 0.0);
    m0 = m0 * m0;
    m1 = m1 * m1;
    return 49.0 * ( dot(m0*m0, vec3( dot( p0, x0 ), dot( p1, x1 ), dot( p2, x2 )))
                + dot(m1*m1, vec2( dot( p3, x3 ), dot( p4, x4 ) ) ) ) ;
}

// === FBM (Fractal Brownian Motion) ===
const int MAX_OCTAVES = 8;

float fbm(vec4 p) {
    float value = 0.0;
    float amp = 0.5;
    float freq = 1.0;
    for (int i = 0; i < MAX_OCTAVES; i++) {
        if (i >= uFBMOctaves) break;
        value += amp * snoise(p * freq);
        freq *= 2.0;
        amp *= uFBMPersistence;
    }
    return value * 0.5 + 0.5;
}

// === Utility ===
#define TWO_PI 6.28318530718

vec2 toPolarLoop(float t, float duration) {
  float a = TWO_PI * t / duration;
  return vec2(cos(a), sin(a));
}

float easeInOut(float x, float k) {
  if (x < 0.5) {
    return 0.5 * pow(2.0 * x, k);
  } else {
    return 1.0 - 0.5 * pow(2.0 * (1.0 - x), k);
  }
}

vec3 blendColors(float n) {
    float segment = 1.0 / float(uNumStops - 1);
    float index = n / segment;
    int i = int(floor(index));
    float t = fract(index);
    
    // Clamp to valid range
    i = min(i, uNumStops - 2);
    t = clamp(t, 0.0, 1.0);
    
    return mix(uColors[i], uColors[i + 1], t);
}

// === Shader ===
void main() {
    vec2 uv = vUv;
 
    vec2 timeLoop = toPolarLoop(uTime, uLoopDuration); 

    vec2 warp = vec2(snoise(vec4(uv * 1.5, timeLoop)), snoise(vec4((uv + 10.0) * 1.5, timeLoop))) * uWarpScale;

    float n = fbm(vec4((uv + warp) * uNoiseScale, timeLoop));
    vec3 color = blendColors(easeInOut(n, uSmoothing)); 
  
    vec3 rgbNoise = randomColor(uv) - 0.5;
    float rNoise = rgbNoise.r - 0.5;
    vec3 noise = mix(vec3(rNoise), rgbNoise, uNoiseColor) * uGrainAmount;
    gl_FragColor = vec4(color + noise, 1.0);
}
`;

export { vertexShader, fragmentShader };
