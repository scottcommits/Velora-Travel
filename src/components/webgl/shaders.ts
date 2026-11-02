export const VERTEX_SHADER = /* glsl */ `
  uniform float uVelocity;
  uniform float uHover;
  uniform vec2 uMouse;
  uniform float uTime;

  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 pos = position;

    // Subtle scroll-velocity wave distortion (clamped for tasteful, minimal feel)
    float vel = clamp(uVelocity * 0.00045, -0.035, 0.035);
    float wave = sin(uv.y * 3.14159265) * sin(uv.x * 3.14159265);
    pos.y += vel * wave * 0.65;
    pos.x += vel * cos(uv.y * 6.2831853 + uTime * 1.5) * 0.15;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export const FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  uniform sampler2D uTexture;
  uniform vec2 uPlaneSize;
  uniform vec2 uTextureSize;
  uniform vec2 uMouse;
  uniform float uHover;
  uniform float uVelocity;
  uniform float uTime;
  uniform float uAlpha;
  uniform float uRadius;
  uniform float uAlignY;
  uniform float uZoom;
  uniform vec2 uViewport;
  uniform vec4 uClipRect;
  uniform float uHasClip;
  uniform float uBorderWidth;
  uniform vec3 uBorderColor;

  varying vec2 vUv;

  float sdRoundedBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
  }

  vec2 getCoverUv(vec2 uv, vec2 planeSize, vec2 texSize, float alignY, float zoom) {
    float planeAspect = planeSize.x / max(planeSize.y, 1.0);
    float texAspect = texSize.x / max(texSize.y, 1.0);

    vec2 scale = vec2(1.0);
    if (planeAspect > texAspect) {
      scale.y = texAspect / planeAspect;
    } else {
      scale.x = planeAspect / texAspect;
    }

    scale /= max(zoom, 1.0);

    vec2 offset = vec2(
      (1.0 - scale.x) * 0.5,
      (1.0 - scale.y) * (1.0 - alignY)
    );

    return uv * scale + offset;
  }

  void main() {
    // Rounded-rectangle mask in local plane pixel coordinates
    vec2 localPx = (vUv - 0.5) * uPlaneSize;
    float dBox = sdRoundedBox(localPx, uPlaneSize * 0.5, uRadius);
    float boxMask = 1.0 - smoothstep(-0.75, 0.75, dBox);
    if (boxMask <= 0.001) discard;

    // Optional parent container rounded-rect clip (for bleeding CTA collage photos)
    float clipMask = 1.0;
    if (uHasClip > 0.5) {
      vec2 screenPx = vec2(gl_FragCoord.x, uViewport.y - gl_FragCoord.y);
      vec2 clipCenter = uClipRect.xy + uClipRect.zw * 0.5;
      float dClip = sdRoundedBox(screenPx - clipCenter, uClipRect.zw * 0.5, 24.0);
      clipMask = 1.0 - smoothstep(-0.75, 0.75, dClip);
      if (clipMask <= 0.001) discard;
    }

    vec2 baseUv = getCoverUv(vUv, uPlaneSize, uTextureSize, uAlignY, uZoom);

    // Soft mouse ripple in aspect-corrected UV space
    vec2 aspect = vec2(uPlaneSize.x / max(uPlaneSize.y, 1.0), 1.0);
    vec2 diff = (vUv - uMouse) * aspect;
    float dist = length(diff);
    float rippleWave = sin(dist * 20.0 - uTime * 3.8) * exp(-dist * 5.5);
    vec2 dir = dist > 0.0001 ? normalize(diff) : vec2(0.0);
    vec2 rippleOffset = dir * rippleWave * 0.0038 * uHover;

    // Subtle velocity distortion + RGB shift (max ~2-3px equivalent)
    float velNorm = clamp(uVelocity * 0.00018, -0.0032, 0.0032);
    vec2 velOffset = vec2(0.0, velNorm * sin(vUv.x * 3.14159265));

    vec2 sampleUv = clamp(baseUv + rippleOffset + velOffset, 0.002, 0.998);
    vec2 rgbShift = vec2(velNorm * 0.45, velNorm * 0.85) + rippleOffset * 0.35;

    float r = texture2D(uTexture, clamp(sampleUv + rgbShift, 0.002, 0.998)).r;
    float g = texture2D(uTexture, sampleUv).g;
    float b = texture2D(uTexture, clamp(sampleUv - rgbShift, 0.002, 0.998)).b;

    vec3 color = vec3(r, g, b);
    if (uBorderWidth > 0.1) {
      float borderMix = smoothstep(-uBorderWidth - 0.65, -uBorderWidth + 0.65, dBox);
      color = mix(color, uBorderColor, borderMix);
    }

    gl_FragColor = vec4(color, uAlpha * boxMask * clipMask);
  }
`;
