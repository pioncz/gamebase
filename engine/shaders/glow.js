const GlowShader = {
  vertexShader: `
    uniform vec3 viewVector;
    uniform float i;
    uniform float c;
    uniform float p;
    varying float intensity;
    void main() 
    {
        vec3 vNormal = normalize( normalMatrix * normal );
      vec3 vNormel = normalize( normalMatrix * viewVector );
      intensity = pow( c - dot(vNormal, vNormel), p ) * i;

        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
  `,
  fragmentShader: `
  uniform vec3 glowColor;
  varying float intensity;
  void main() 
  {
    vec3 glow = glowColor * intensity;
    float intensity2 = intensity * 1.4;
    float intensity3 = (intensity2 > 1.0 ? 1.0 : intensity2);
    gl_FragColor = vec4( glow, intensity2 > 1.0 ? 1.0 : intensity2 );
  }
  `,
};

export default GlowShader;
