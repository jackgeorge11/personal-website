uniform vec3 iResolution;
uniform float iTime;
uniform sampler2D uDisplacement;
uniform vec4 colorSwap;
uniform float rings;
varying vec3 vPosition;
varying vec2 vUv;
float PI = 3.14159265359;

void main()
{
  vec4 displacement = texture2D(uDisplacement, vUv);
  float theta = displacement.r * (5. + sin(iTime)) * PI;
  vec2 dir = vec2(sin(theta), cos(theta));
  vec2 uv = vUv + dir * displacement.r * (.8 + (sin(iTime) * .8));

  vec2 U = gl_FragCoord.xy;
	float t = iTime/.1;
	vec2  R =  iResolution.xy, S = vec2(100,100),
          p = ( U+U - R ) / R * S,
          q = vec2(cos(-t / 165.), cos( t / 45.))  * S - p;
  t = 1. + cos( length( vec2(cos( t / 98.),  sin( t / 178.)) * S - p ) / 30.) 
          + cos( length( vec2(sin(-t / 124.), cos( t / 104.)) * S - p ) / 20.) 
          + sin( length(q) / 25. ) * sin(q.x / 20.) * sin(q.y / 15.);
  gl_FragColor = (colorSwap * 1.5 + cos(vec4(1.,1.,-.45,1) + (t * rings + vec4(uv,-.5,1))));
}