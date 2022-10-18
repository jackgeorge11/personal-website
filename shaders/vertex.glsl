varying vec3 vPosition;
varying vec2 vUv;

void main() {
  vUv = uv;
  vPosition = position;
  // vXy = gl_FragCoord.xy;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}