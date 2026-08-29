import * as React from "react";
import { useEffect, useRef, forwardRef, useState, useCallback, useMemo, memo, useSyncExternalStore } from "react";

// ─── WebGL Shader Infrastructure ─────────────────────────────────────────────

var vertexShaderSource = `#version 300 es
precision mediump float;
layout(location = 0) in vec4 a_position;
uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform float u_imageAspectRatio;
uniform float u_originX;
uniform float u_originY;
uniform float u_worldWidth;
uniform float u_worldHeight;
uniform float u_fit;
uniform float u_scale;
uniform float u_rotation;
uniform float u_offsetX;
uniform float u_offsetY;
out vec2 v_objectUV;
out vec2 v_objectBoxSize;
out vec2 v_responsiveUV;
out vec2 v_responsiveBoxGivenSize;
out vec2 v_patternUV;
out vec2 v_patternBoxSize;
out vec2 v_imageUV;
vec3 getBoxSize(float boxRatio, vec2 givenBoxSize) {
  vec2 box = vec2(0.);
  box.x = boxRatio * min(givenBoxSize.x / boxRatio, givenBoxSize.y);
  float noFitBoxWidth = box.x;
  if (u_fit == 1.) { box.x = boxRatio * min(u_resolution.x / boxRatio, u_resolution.y); }
  else if (u_fit == 2.) { box.x = boxRatio * max(u_resolution.x / boxRatio, u_resolution.y); }
  box.y = box.x / boxRatio;
  return vec3(box, noFitBoxWidth);
}
void main() {
  gl_Position = a_position;
  vec2 uv = gl_Position.xy * .5;
  vec2 boxOrigin = vec2(.5 - u_originX, u_originY - .5);
  vec2 givenBoxSize = vec2(u_worldWidth, u_worldHeight);
  givenBoxSize = max(givenBoxSize, vec2(1.)) * u_pixelRatio;
  float r = u_rotation * 3.14159265358979323846 / 180.;
  mat2 graphicRotation = mat2(cos(r), sin(r), -sin(r), cos(r));
  vec2 graphicOffset = vec2(-u_offsetX, u_offsetY);
  float fixedRatio = 1.;
  vec2 fixedRatioBoxGivenSize = vec2(
    (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
    (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y);
  v_objectBoxSize = getBoxSize(fixedRatio, fixedRatioBoxGivenSize).xy;
  vec2 objectWorldScale = u_resolution.xy / v_objectBoxSize;
  v_objectUV = uv;
  v_objectUV *= objectWorldScale;
  v_objectUV += boxOrigin * (objectWorldScale - 1.);
  v_objectUV += graphicOffset;
  v_objectUV /= u_scale;
  v_objectUV = graphicRotation * v_objectUV;
  v_responsiveBoxGivenSize = vec2(
    (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
    (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y);
  float responsiveRatio = v_responsiveBoxGivenSize.x / v_responsiveBoxGivenSize.y;
  vec2 responsiveBoxSize = getBoxSize(responsiveRatio, v_responsiveBoxGivenSize).xy;
  vec2 responsiveBoxScale = u_resolution.xy / responsiveBoxSize;
  v_responsiveUV = uv;
  v_responsiveUV *= responsiveBoxScale;
  v_responsiveUV += boxOrigin * (responsiveBoxScale - 1.);
  v_responsiveUV += graphicOffset;
  v_responsiveUV /= u_scale;
  v_responsiveUV.x *= responsiveRatio;
  v_responsiveUV = graphicRotation * v_responsiveUV;
  v_responsiveUV.x /= responsiveRatio;
  float patternBoxRatio = givenBoxSize.x / givenBoxSize.y;
  vec2 patternBoxGivenSize = vec2(
    (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
    (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y);
  patternBoxRatio = patternBoxGivenSize.x / patternBoxGivenSize.y;
  vec3 boxSizeData = getBoxSize(patternBoxRatio, patternBoxGivenSize);
  v_patternBoxSize = boxSizeData.xy;
  float patternBoxNoFitBoxWidth = boxSizeData.z;
  vec2 patternBoxScale = u_resolution.xy / v_patternBoxSize;
  v_patternUV = uv;
  v_patternUV += graphicOffset / patternBoxScale;
  v_patternUV += boxOrigin;
  v_patternUV -= boxOrigin / patternBoxScale;
  v_patternUV *= u_resolution.xy;
  v_patternUV /= u_pixelRatio;
  if (u_fit > 0.) { v_patternUV *= (patternBoxNoFitBoxWidth / v_patternBoxSize.x); }
  v_patternUV /= u_scale;
  v_patternUV = graphicRotation * v_patternUV;
  v_patternUV += boxOrigin / patternBoxScale;
  v_patternUV -= boxOrigin;
  v_patternUV *= .01;
  vec2 imageBoxSize;
  if (u_fit == 1.) { imageBoxSize.x = min(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio; }
  else if (u_fit == 2.) { imageBoxSize.x = max(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio; }
  else { imageBoxSize.x = min(10.0, 10.0 / u_imageAspectRatio * u_imageAspectRatio); }
  imageBoxSize.y = imageBoxSize.x / u_imageAspectRatio;
  vec2 imageBoxScale = u_resolution.xy / imageBoxSize;
  v_imageUV = uv;
  v_imageUV *= imageBoxScale;
  v_imageUV += boxOrigin * (imageBoxScale - 1.);
  v_imageUV += graphicOffset;
  v_imageUV /= u_scale;
  v_imageUV.x *= u_imageAspectRatio;
  v_imageUV = graphicRotation * v_imageUV;
  v_imageUV.x /= u_imageAspectRatio;
  v_imageUV += .5;
  v_imageUV.y = 1. - v_imageUV.y;
}`;

var ditheringFragmentShader = `#version 300 es
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform float u_originX;
uniform float u_originY;
uniform float u_worldWidth;
uniform float u_worldHeight;
uniform float u_fit;
uniform float u_scale;
uniform float u_rotation;
uniform float u_offsetX;
uniform float u_offsetY;
uniform float u_pxSize;
uniform vec4 u_colorBack;
uniform vec4 u_colorFront;
uniform float u_shape;
uniform float u_type;
out vec4 fragColor;
#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846
vec3 permute(vec3 x){return mod(((x*34.0)+1.0)*x,289.0);}
float snoise(vec2 v){
  const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
  vec2 i=floor(v+dot(v,C.yy));
  vec2 x0=v-i+dot(i,C.xx);
  vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);
  vec4 x12=x0.xyxy+C.xxzz;
  x12.xy-=i1;
  i=mod(i,289.0);
  vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
  vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);
  m=m*m;m=m*m;
  vec3 x2=2.0*fract(p*C.www)-1.0;
  vec3 h=abs(x2)-0.5;
  vec3 ox=floor(x2+0.5);
  vec3 a0=x2-ox;
  m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);
  vec3 g;
  g.x=a0.x*x0.x+h.x*x0.y;
  g.yz=a0.yz*x12.xz+h.yz*x12.yw;
  return 130.0*dot(m,g);
}
float hash21(vec2 p){p=fract(p*vec2(0.3183099,0.3678794))+0.1;p+=dot(p,p+19.19);return fract(p.x*p.y);}
const int bayer8x8[64]=int[64](0,32,8,40,2,34,10,42,48,16,56,24,50,18,58,26,12,44,4,36,14,46,6,38,60,28,52,20,62,30,54,22,3,35,11,43,1,33,9,41,51,19,59,27,49,17,57,25,15,47,7,39,13,45,5,37,63,31,55,23,61,29,53,21);
const int bayer4x4[16]=int[16](0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5);
float getBayerValue(vec2 uv,int size){
  ivec2 pos=ivec2(fract(uv/float(size))*float(size));
  int index=pos.y*size+pos.x;
  if(size==4)return float(bayer4x4[index])/16.0;
  return float(bayer8x8[index])/64.0;
}
void main(){
  float t=.5*u_time;
  float pxSize=u_pxSize*u_pixelRatio;
  vec2 pxSizeUV=gl_FragCoord.xy-.5*u_resolution;
  pxSizeUV/=pxSize;
  vec2 canvasPixelizedUV=(floor(pxSizeUV)+.5)*pxSize;
  vec2 normalizedUV=canvasPixelizedUV/u_resolution;
  vec2 shapeUV=normalizedUV;
  vec2 boxOrigin=vec2(.5-u_originX,u_originY-.5);
  vec2 givenBoxSize=vec2(u_worldWidth,u_worldHeight);
  givenBoxSize=max(givenBoxSize,vec2(1.))*u_pixelRatio;
  float r=u_rotation*PI/180.;
  mat2 graphicRotation=mat2(cos(r),sin(r),-sin(r),cos(r));
  vec2 patternBoxSize=vec2((u_worldWidth==0.)?u_resolution.x:givenBoxSize.x,(u_worldHeight==0.)?u_resolution.y:givenBoxSize.y);
  float patternBoxRatio=patternBoxSize.x/patternBoxSize.y;
  float patternNoFitWidth=patternBoxRatio*min(patternBoxSize.x/patternBoxRatio,patternBoxSize.y);
  float pBoxW=patternBoxRatio*min(u_resolution.x/patternBoxRatio,u_resolution.y);
  vec2 pb=vec2(pBoxW,pBoxW/patternBoxRatio);
  vec2 ps=u_resolution.xy/pb;
  shapeUV+=vec2(-u_offsetX,u_offsetY)/ps;
  shapeUV+=boxOrigin;
  shapeUV-=boxOrigin/ps;
  shapeUV*=u_resolution.xy;
  shapeUV/=u_pixelRatio;
  shapeUV*=(patternNoFitWidth/pb.x);
  shapeUV/=u_scale;
  shapeUV=graphicRotation*shapeUV;
  shapeUV+=boxOrigin/ps;
  shapeUV-=boxOrigin;
  shapeUV+=.5;
  float shape=0.;
  if(u_shape<2.5){
    shapeUV*=.003;
    for(float i=1.0;i<6.0;i++){shapeUV.x+=0.6/i*cos(i*2.5*shapeUV.y+t);shapeUV.y+=0.6/i*cos(i*1.5*shapeUV.x+t);}
    shape=.15/max(0.001,abs(sin(t-shapeUV.y-shapeUV.x)));
    shape=smoothstep(0.02,1.,shape);
  } else if(u_shape<3.5){
    shapeUV*=.05;
    float stripeIdx=floor(2.*shapeUV.x/TWO_PI);
    float rand=fract(sin(stripeIdx*127.1)*43758.5453);
    rand=sign(rand-.5)*pow(.1+abs(rand),.4);
    shape=sin(shapeUV.x)*cos(shapeUV.y-5.*rand*t);
    shape=pow(abs(shape),6.);
  } else if(u_shape<5.5){
    float dist=length(shapeUV-.5);
    shape=sin(pow(dist,1.7)*7.-3.*t)*.5+.5;
  } else {
    shapeUV*=.001;
    shape=.5+.5*(snoise(shapeUV-vec2(0.,.3*t))+.5*snoise(2.*shapeUV+vec2(0.,.32*t)));
    shape=smoothstep(0.3,0.9,shape);
  }
  float dithering=getBayerValue(pxSizeUV,8);
  dithering-=.5;
  float res=step(.5,shape+dithering);
  vec3 fgC=u_colorFront.rgb*u_colorFront.a;
  float fgA=u_colorFront.a;
  vec3 bgC=u_colorBack.rgb*u_colorBack.a;
  float bgA=u_colorBack.a;
  vec3 color=fgC*res;
  float opacity=fgA*res;
  color+=bgC*(1.-opacity);
  opacity+=bgA*(1.-opacity);
  fragColor=vec4(color,opacity);
}`;

var DEFAULT_MAX_PIXEL_COUNT = 1920 * 1080 * 4;
var defaultStyle = `@layer paper-shaders{:where([data-paper-shader]){isolation:isolate;position:relative;& canvas{contain:strict;display:block;position:absolute;inset:0;z-index:-1;width:100%;height:100%;border-radius:inherit;}}}`;

function isSafari() {
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes("safari") && !ua.includes("chrome") && !ua.includes("android");
}

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile error: " + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl, vs, fs) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vs);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fs);
  if (!vertexShader || !fragmentShader) return null;
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program link error: " + gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  gl.detachShader(program, vertexShader);
  gl.detachShader(program, fragmentShader);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);
  return program;
}

class ShaderMount {
  constructor(parentElement, fragmentShader, uniforms, speed = 0, frame = 0, minPixelRatio = 2, maxPixelCount = DEFAULT_MAX_PIXEL_COUNT) {
    this.parentElement = parentElement;
    this.fragmentShader = fragmentShader;
    this.providedUniforms = uniforms;
    this.currentFrame = frame;
    this.speed = speed;
    this.minPixelRatio = minPixelRatio;
    this.maxPixelCount = maxPixelCount;
    this.rafId = null;
    this.lastRenderTime = 0;
    this.currentSpeed = 0;
    this.hasBeenDisposed = false;
    this.resolutionChanged = true;
    this.uniformLocations = {};
    this.uniformCache = {};
    this.parentWidth = 0;
    this.parentHeight = 0;
    this.renderScale = 1;
    this.isSafari = isSafari();

    if (!document.querySelector("style[data-paper-shader]")) {
      const s = document.createElement("style");
      s.innerHTML = defaultStyle;
      s.setAttribute("data-paper-shader", "");
      document.head.prepend(s);
    }

    const canvas = document.createElement("canvas");
    this.canvasElement = canvas;
    parentElement.prepend(canvas);

    const gl = canvas.getContext("webgl2");
    if (!gl) throw new Error("WebGL2 not supported");
    this.gl = gl;

    this.program = createProgram(gl, vertexShaderSource, this.fragmentShader);
    this.setupPositionAttribute();
    this.setupUniforms();
    this.setUniformValues(this.providedUniforms);
    this.setupResizeObserver();
    parentElement.setAttribute("data-paper-shader", "");
    parentElement.paperShaderMount = this;
    document.addEventListener("visibilitychange", this.handleVisibilityChange);
    this.setSpeed(speed);
  }

  setupPositionAttribute() {
    const loc = this.gl.getAttribLocation(this.program, "a_position");
    const buf = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buf);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), this.gl.STATIC_DRAW);
    this.gl.enableVertexAttribArray(loc);
    this.gl.vertexAttribPointer(loc, 2, this.gl.FLOAT, false, 0, 0);
  }

  setupUniforms() {
    this.uniformLocations = {
      u_time: this.gl.getUniformLocation(this.program, "u_time"),
      u_pixelRatio: this.gl.getUniformLocation(this.program, "u_pixelRatio"),
      u_resolution: this.gl.getUniformLocation(this.program, "u_resolution"),
    };
    Object.keys(this.providedUniforms).forEach(key => {
      this.uniformLocations[key] = this.gl.getUniformLocation(this.program, key);
    });
  }

  setupResizeObserver() {
    this.resizeObserver = new ResizeObserver(([entry]) => {
      if (entry?.borderBoxSize[0]) {
        this.parentWidth = entry.borderBoxSize[0].inlineSize;
        this.parentHeight = entry.borderBoxSize[0].blockSize;
      }
      this.handleResize();
    });
    this.resizeObserver.observe(this.parentElement);
  }

  handleResize() {
    const dpr = Math.max(1, window.devicePixelRatio);
    let targetW = Math.round(this.parentWidth) * Math.max(dpr, this.minPixelRatio);
    let targetH = Math.round(this.parentHeight) * Math.max(dpr, this.minPixelRatio);
    const headroom = Math.sqrt(this.maxPixelCount) / Math.sqrt(targetW * targetH);
    const s = Math.min(1, headroom);
    const newW = Math.round(targetW * s);
    const newH = Math.round(targetH * s);
    const newScale = newW / Math.round(this.parentWidth);
    if (this.canvasElement.width !== newW || this.canvasElement.height !== newH || this.renderScale !== newScale) {
      this.renderScale = newScale;
      this.canvasElement.width = newW;
      this.canvasElement.height = newH;
      this.resolutionChanged = true;
      this.gl.viewport(0, 0, newW, newH);
      this.render(performance.now());
    }
  }

  render = (currentTime) => {
    if (this.hasBeenDisposed || !this.program) return;
    const dt = currentTime - this.lastRenderTime;
    this.lastRenderTime = currentTime;
    if (this.currentSpeed !== 0) this.currentFrame += dt * this.currentSpeed;
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.gl.useProgram(this.program);
    this.gl.uniform1f(this.uniformLocations.u_time, this.currentFrame * 1e-3);
    if (this.resolutionChanged) {
      this.gl.uniform2f(this.uniformLocations.u_resolution, this.gl.canvas.width, this.gl.canvas.height);
      this.gl.uniform1f(this.uniformLocations.u_pixelRatio, this.renderScale);
      this.resolutionChanged = false;
    }
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    if (this.currentSpeed !== 0) {
      this.rafId = requestAnimationFrame(this.render);
    } else {
      this.rafId = null;
    }
  };

  setUniformValues(uniforms) {
    this.gl.useProgram(this.program);
    Object.entries(uniforms).forEach(([key, value]) => {
      if (JSON.stringify(this.uniformCache[key]) === JSON.stringify(value)) return;
      this.uniformCache[key] = value;
      const location = this.uniformLocations[key];
      if (!location) return;
      if (Array.isArray(value)) {
        if (value.length === 4) this.gl.uniform4fv(location, value);
        else if (value.length === 3) this.gl.uniform3fv(location, value);
        else if (value.length === 2) this.gl.uniform2fv(location, value);
      } else if (typeof value === "number") {
        this.gl.uniform1f(location, value);
      } else if (typeof value === "boolean") {
        this.gl.uniform1i(location, value ? 1 : 0);
      }
    });
  }

  setSpeed(speed) {
    this.speed = speed;
    this.currentSpeed = document.hidden ? 0 : speed;
    if (this.rafId === null && this.currentSpeed !== 0) {
      this.lastRenderTime = performance.now();
      this.rafId = requestAnimationFrame(this.render);
    }
    if (this.rafId !== null && this.currentSpeed === 0) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  setUniforms(newUniforms) {
    this.setUniformValues(newUniforms);
    this.providedUniforms = { ...this.providedUniforms, ...newUniforms };
    this.render(performance.now());
  }

  handleVisibilityChange = () => {
    this.currentSpeed = document.hidden ? 0 : this.speed;
    if (!document.hidden && this.speed !== 0 && this.rafId === null) {
      this.lastRenderTime = performance.now();
      this.rafId = requestAnimationFrame(this.render);
    }
  };

  dispose() {
    this.hasBeenDisposed = true;
    if (this.rafId !== null) { cancelAnimationFrame(this.rafId); this.rafId = null; }
    if (this.gl && this.program) { this.gl.deleteProgram(this.program); this.program = null; }
    if (this.resizeObserver) { this.resizeObserver.disconnect(); this.resizeObserver = null; }
    document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    this.canvasElement.remove();
    delete this.parentElement.paperShaderMount;
  }
}

// ─── Color Utilities ─────────────────────────────────────────────────────────

function hexToRgba(hex) {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) hex = hex.split("").map(c => c + c).join("");
  if (hex.length === 6) hex += "ff";
  return [
    parseInt(hex.slice(0,2),16)/255,
    parseInt(hex.slice(2,4),16)/255,
    parseInt(hex.slice(4,6),16)/255,
    parseInt(hex.slice(6,8),16)/255,
  ];
}

function getShaderColor(colorString) {
  if (Array.isArray(colorString)) return colorString.length === 4 ? colorString : [...colorString, 1];
  if (typeof colorString !== "string") return [0,0,0,1];
  if (colorString.startsWith("#")) return hexToRgba(colorString);
  return [0,0,0,1];
}

// ─── ShaderMount React Component ─────────────────────────────────────────────

var ShaderMountReact = forwardRef(function ShaderMountReactImpl({
  fragmentShader, uniforms: uniformsProp, speed = 0, frame = 0,
  width, height, style, minPixelRatio, maxPixelCount, ...divProps
}, forwardedRef) {
  const divRef = useRef(null);
  const shaderRef = useRef(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (divRef.current && !shaderRef.current) {
      try {
        shaderRef.current = new ShaderMount(divRef.current, fragmentShader, uniformsProp, speed, frame, minPixelRatio, maxPixelCount);
        setInitialized(true);
      } catch (err) {
        console.warn("WebGL shader disabled or unsupported:", err?.message);
      }
    }
    return () => { shaderRef.current?.dispose(); shaderRef.current = null; };
  }, [fragmentShader]);

  useEffect(() => {
    if (initialized) shaderRef.current?.setUniforms(uniformsProp);
  }, [uniformsProp, initialized]);

  useEffect(() => {
    if (initialized) shaderRef.current?.setSpeed(speed);
  }, [speed, initialized]);

  const mergedRef = useCallback(node => {
    divRef.current = node;
    if (typeof forwardedRef === "function") forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  }, [forwardedRef]);

  return (
    <div
      ref={mergedRef}
      style={width != null || height != null ? { width, height, ...style } : style}
      {...divProps}
    />
  );
});

// ─── Dithering Shader Component ──────────────────────────────────────────────

var DitheringShapes = { simplex: 6, warp: 2, dots: 3, wave: 4, ripple: 5, swirl: 6, sphere: 7 };
var ShaderFitOptions = { none: 0, contain: 1, cover: 2 };

var Dithering = memo(function DitheringImpl({
  speed = 0.4, frame = 0, colorBack = "#000000", colorFront = "#ffffff",
  shape = "warp", size = 0.5, fit = "none", scale = 1, rotation = 0,
  originX = 0.5, originY = 0.5, offsetX = 0, offsetY = 0,
  worldWidth = 0, worldHeight = 0, ...props
}) {
  const uniforms = {
    u_colorBack: getShaderColor(colorBack),
    u_colorFront: getShaderColor(colorFront),
    u_shape: DitheringShapes[shape] ?? 6,
    u_type: 4, // 8x8 bayer
    u_pxSize: size,
    u_fit: ShaderFitOptions[fit] ?? 0,
    u_scale: scale,
    u_rotation: rotation,
    u_offsetX: offsetX,
    u_offsetY: offsetY,
    u_originX: originX,
    u_originY: originY,
    u_worldWidth: worldWidth,
    u_worldHeight: worldHeight,
  };
  return <ShaderMountReact {...props} speed={speed} frame={frame} fragmentShader={ditheringFragmentShader} uniforms={uniforms} />;
});

// ─── Ticket Geometry & Layout ─────────────────────────────────────────────────

var REF = 741;
export var TICKET_GEOMETRY = {
  aspect: 741 / 425,
  cornerRadius: 25 / REF,
  notchRadius: 21 / REF,
  perforation: 562 / REF,
};

export var TICKET_LAYOUT = {
  padding: 57 / REF,
  labelTop: 58 / REF,
  labelSize: 19.72 / REF,
  labelLead: 28 / REF,
  labelTracking: 0.016,
  nameTop: 185 / REF,
  nameSize: 64.79 / REF,
  nameLead: 65 / REF,
  nameTracking: -0.01,
  footerTop: 348 / REF,
  footerSize: 19.72 / REF,
  footerTracking: 0.016,
  stubSize: 67.61 / REF,
  stubTracking: 0,
  stubOpacity: 0.88,
  watermarkSize: 144 / REF,
  watermarkOpacity: 0.55,
  watermarkColor: "#c8b4f0",
  inkColor: "#e8ddff",
};

export var TICKET_TEXTURE = {
  engine: "generative",
  colorBack: "#1a0a3a",
  colorFront: "#7c3aed",
  shape: "warp",
  type: "8x8",
  size: 0.6,
  scale: 1.2,
  rotation: 0,
  offsetX: 0,
  offsetY: 0,
  speed: 0.3,
};

export function ticketClipPath(width, height, geometry = TICKET_GEOMETRY) {
  const r = geometry.cornerRadius * width;
  const n = geometry.notchRadius * width;
  const p = geometry.perforation * width;
  return [
    `M ${r} 0`, `L ${p - n} 0`, `A ${n} ${n} 0 0 0 ${p + n} 0`,
    `L ${width - r} 0`, `A ${r} ${r} 0 0 0 ${width} ${r}`,
    `L ${width} ${height - r}`, `A ${r} ${r} 0 0 0 ${width - r} ${height}`,
    `L ${p + n} ${height}`, `A ${n} ${n} 0 0 0 ${p - n} ${height}`,
    `L ${r} ${height}`, `A ${r} ${r} 0 0 0 0 ${height - r}`,
    `L 0 ${r}`, `A ${r} ${r} 0 0 0 ${r} 0`, "Z",
  ].join(" ");
}

function splitName(name, max = 3) {
  if (!name) return [];
  if (name.includes("\n")) {
    return name.split("\n").map((l) => l.trim().toUpperCase()).filter(Boolean);
  }
  const clean = name.trim().replace(/\s+/g, " ").toUpperCase();
  if (!clean) return [];
  const lines = [];
  for (const word of clean.split(" ")) {
    if (lines.length < max) lines.push(word);
    else lines[lines.length - 1] = `${lines[lines.length - 1]} ${word}`;
  }
  return lines;
}

function fitScale(lines, { availableWidth, availableHeight, fontSize, lineHeight, tracking }) {
  if (!lines.length) return 1;
  const longest = Math.max(...lines.map(l => l.length));
  const charWidth = (0.6 + tracking) * fontSize;
  const block = lines.length * lineHeight;
  return Math.max(0.05, Math.min(
    1,
    charWidth > 0 ? availableWidth / (longest * charWidth) : 1,
    block > 0 && availableHeight > 0 ? availableHeight / block : 1,
  ));
}

// ─── TicketCard ───────────────────────────────────────────────────────────────

export function TicketCard({
  name, presenter, event, venue, dates, stubText, watermark,
  width = REF,
  geometry = TICKET_GEOMETRY,
  layout = TICKET_LAYOUT,
  texture = TICKET_TEXTURE,
  className,
}) {
  const height = width / geometry.aspect;
  const perfX = geometry.perforation * width;

  const lines = splitName(name);
  const scale = fitScale(lines, {
    availableWidth: perfX - layout.padding * width - 0.03 * width,
    availableHeight: layout.footerTop * width - layout.nameTop * width - 0.02 * width,
    fontSize: layout.nameSize * width,
    lineHeight: layout.nameLead * width,
    tracking: layout.nameTracking,
  });

  const shaderStyle = { position: "absolute", inset: 0, width, height };

  return (
    <div
      className={`relative select-none ${className ?? ""}`}
      style={{ width, height, clipPath: `path('${ticketClipPath(width, height, geometry)}')` }}
    >
      {/* Background */}
      <div className="absolute inset-0" style={{ background: texture.colorBack }} />

      {/* Dithering shader texture */}
      <Dithering
        colorBack={texture.colorBack}
        colorFront={texture.colorFront}
        shape={texture.shape}
        size={texture.size}
        scale={texture.scale}
        rotation={texture.rotation}
        offsetX={texture.offsetX}
        offsetY={texture.offsetY}
        speed={texture.speed}
        style={shaderStyle}
      />

      {/* Perforation line */}
      <div
        className="absolute top-0 bottom-0"
        style={{
          left: perfX,
          width: Math.max(1, 0.0022 * width),
          backgroundImage: `repeating-linear-gradient(to bottom, ${layout.inkColor}55 0 ${0.012 * width}px, transparent ${0.012 * width}px ${0.024 * width}px)`,
        }}
      />

      {/* Watermark in stub */}
      <div
        className="pointer-events-none absolute grid place-items-center font-bold tabular-nums"
        style={{ left: perfX, top: 0, width: width - perfX, height, color: layout.watermarkColor, opacity: layout.watermarkOpacity }}
      >
        <span style={{ writingMode: "vertical-rl", fontSize: layout.watermarkSize * width, lineHeight: 1, letterSpacing: "-0.04em" }}>
          {watermark}
        </span>
      </div>

      {/* Text Content */}
      <div className="absolute inset-0" style={{ color: layout.inkColor }}>
        {/* Label: presenter + event */}
        <div
          className="absolute whitespace-pre uppercase"
          style={{
            left: layout.padding * width,
            top: layout.labelTop * width,
            fontSize: layout.labelSize * width,
            lineHeight: `${layout.labelLead * width}px`,
            letterSpacing: `${layout.labelTracking}em`,
          }}
        >
          {presenter}{"\n"}{event}
        </div>

        {/* Name (big) */}
        <div
          className="absolute font-medium"
          style={{
            left: layout.padding * width,
            top: layout.nameTop * width,
            fontSize: layout.nameSize * width * scale,
            lineHeight: `${layout.nameLead * width * scale}px`,
            letterSpacing: `${layout.nameTracking}em`,
          }}
        >
          {lines.map((line, i) => <div key={i}>{line}</div>)}
        </div>

        {/* Footer: venue · dates */}
        <div
          className="absolute whitespace-nowrap uppercase"
          style={{
            left: layout.padding * width,
            top: layout.footerTop * width,
            fontSize: layout.footerSize * width,
            letterSpacing: `${layout.footerTracking}em`,
          }}
        >
          {venue} · {dates}
        </div>

        {/* Stub text */}
        <div
          className="absolute grid place-items-center font-medium whitespace-nowrap uppercase"
          style={{
            left: perfX, top: 0, width: width - perfX, height,
            fontSize: layout.stubSize * width,
            letterSpacing: `${layout.stubTracking}em`,
            opacity: layout.stubOpacity,
          }}
        >
          <span style={{ writingMode: "vertical-rl" }}>{stubText}</span>
        </div>
      </div>
    </div>
  );
}

// ─── AdmitOneTicket (no tilt by default) ─────────────────────────────────────

export function AdmitOneTicket({ tilt, ...props }) {
  // tilt=false → flat card (user requested no 3D effect)
  return <TicketCard {...props} />;
}

export default AdmitOneTicket;
