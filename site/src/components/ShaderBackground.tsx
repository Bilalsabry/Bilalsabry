"use client";

import { useEffect, useRef } from "react";

/**
 * Full-bleed animated aurora, rendered with a raw WebGL fragment shader on a
 * single fullscreen triangle. Domain-warped fbm noise creates slow drifting
 * ribbons graded from ink → teal → indigo, with a soft light that follows the
 * pointer. Pauses when offscreen; falls back to a CSS gradient if WebGL or
 * reduced-motion is unavailable. Designed to sit behind the hero at low cost.
 */
const FRAG = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;

// hash + value noise + fbm
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p); vec2 f = fract(p);
  vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(hash(i+vec2(0.0,0.0)), hash(i+vec2(1.0,0.0)), u.x),
             mix(hash(i+vec2(0.0,1.0)), hash(i+vec2(1.0,1.0)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0; float a = 0.5;
  for(int i=0;i<6;i++){ v += a*noise(p); p *= 2.02; a *= 0.5; }
  return v;
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_res.xy;
  vec2 p = uv;
  p.x *= u_res.x / u_res.y;
  float t = u_time * 0.05;

  // domain warp
  vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2,1.3) - t));
  vec2 r = vec2(fbm(p + 1.7*q + vec2(8.3,2.8) + t*0.6),
                fbm(p + 1.7*q + vec2(1.2,6.5) - t*0.4));
  float f = fbm(p + 2.0*r);

  // palette: ink base, teal + indigo ribbons, faint warm
  vec3 ink    = vec3(0.027, 0.031, 0.039);
  vec3 teal   = vec3(0.250, 0.870, 0.760);
  vec3 indigo = vec3(0.380, 0.360, 0.980);
  vec3 warm   = vec3(0.980, 0.760, 0.380);

  vec3 col = ink;
  col = mix(col, indigo*0.55, smoothstep(0.25, 0.75, f));
  col = mix(col, teal*0.65,   smoothstep(0.45, 0.95, r.x));
  col = mix(col, warm*0.30,   smoothstep(0.6, 1.0, q.y)*0.4);

  // pointer light
  vec2 m = u_mouse / u_res.xy; m.x *= u_res.x/u_res.y;
  float d = distance(p, m);
  col += teal * 0.18 * smoothstep(0.6, 0.0, d);

  // vignette + lift toward ink at edges
  float vig = smoothstep(1.25, 0.2, length(uv - 0.5));
  col *= mix(0.35, 1.0, vig);
  col = mix(ink, col, 0.92);

  gl_FragColor = vec4(col, 1.0);
}
`;

const VERT = `
attribute vec2 a_pos;
void main(){ gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

export default function ShaderBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const gl = canvas.getContext("webgl", {
      antialias: false,
      alpha: false,
      premultipliedAlpha: false,
    });
    if (!gl || reduce) {
      // CSS fallback handled by the static gradient layer below.
      canvas.style.display = "none";
      return;
    }

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      canvas.style.display = "none";
      return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    // single large triangle covering the viewport
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );
    const loc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "u_res");
    const uTime = gl.getUniformLocation(prog, "u_time");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");

    const mouse = { x: 0, y: 0 };
    const targetMouse = { x: 0, y: 0 };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      const w = canvas.clientWidth * dpr;
      const h = canvas.clientHeight * dpr;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    const onMove = (e: PointerEvent) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      targetMouse.x = e.clientX * dpr;
      targetMouse.y = (window.innerHeight - e.clientY) * dpr;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", resize);
    resize();

    let raf = 0;
    let running = true;
    const start = performance.now();

    const render = (now: number) => {
      if (!running) return;
      mouse.x += (targetMouse.x - mouse.x) * 0.06;
      mouse.y += (targetMouse.y - mouse.y) * 0.06;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, (now - start) / 1000);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    // pause when the hero scrolls out of view
    const io = new IntersectionObserver(
      ([entry]) => {
        running = entry.isIntersecting;
        if (running) raf = requestAnimationFrame(render);
        else cancelAnimationFrame(raf);
      },
      { threshold: 0 }
    );
    io.observe(canvas);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        // static gradient fallback sits underneath the canvas
        background:
          "radial-gradient(120% 90% at 70% 10%, #14203a 0%, #0a0e16 45%, #07080a 100%)",
      }}
    >
      <canvas ref={ref} style={{ width: "100%", height: "100%", display: "block" }} />
      {/* readability scrim toward the bottom for hero text */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(7,8,10,0.1) 0%, rgba(7,8,10,0.2) 55%, rgba(7,8,10,0.9) 100%)",
        }}
      />
    </div>
  );
}
