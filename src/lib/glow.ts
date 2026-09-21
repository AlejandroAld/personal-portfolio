/**
 * Fondo del héroe: un shader de fragmento en WebGL crudo.
 *
 * Sin three.js ni ninguna librería 3D. Un triángulo a pantalla completa y un
 * shader; todo lo demás es el degradado CSS que ya está debajo.
 *
 * TOPE DE BRILLO, que es el requisito que manda sobre la estética. El texto del
 * héroe va encima de esto, así que el color más claro que el shader puede
 * producir está calculado para que TODO color de texto de la página siga
 * pasando AA:
 *
 *   texto        luminancia   fondo máx. permitido para 4.5:1
 *   accent       0.2355       L ≤ 0.0134   ← el más restrictivo
 *   subtle       0.2610       L ≤ 0.0191
 *   muted        0.3597       L ≤ 0.0411
 *
 * El pico del shader es base + tinte = rgb(0.070, 0.105, 0.205), cuya
 * luminancia relativa es 0.0115, por debajo del más restrictivo. Subir el
 * tinte rompe el contraste del texto de acento: si se toca, se recalcula.
 */

const VERT_2 = "#version 300 es\nin vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
const VERT_1 = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";

/** `highp` importa: el hash de ruido produce patrones visibles en mediump. */
const PREC =
  "#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\n";

const BODY = `
uniform vec2 r;
uniform float t;

float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}

float n(vec2 p){
  vec2 i=floor(p),f=fract(p);
  f=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);
}

float fbm(vec2 p){
  float v=0.,a=.5;
  for(int i=0;i<4;i++){v+=a*n(p);p*=2.03;a*=.5;}
  return v;
}

void main(){
  vec2 uv=gl_FragCoord.xy/r;
  vec2 p=vec2(uv.x*(r.x/r.y),uv.y)*1.3;

  // Deformación del dominio: da profundidad sin dibujar figuras. Nada de
  // partículas ni manchas: sólo un campo que se mueve muy despacio.
  float w=fbm(p*.65-vec2(t*.55,t*.3));
  float f=fbm(p+vec2(t,t*.5)+w*.7);

  // Una sola fuente fría, abajo y a la derecha, lejos del bloque de texto.
  float fall=smoothstep(1.15,0.,length(uv-vec2(.72,-.08)));

  vec3 col=vec3(.039)+vec3(.031,.066,.166)*clamp(f*fall,0.,1.);
  col*=1.-.22*smoothstep(.45,1.2,length(uv-.5));

  // Dither: en un degradado tan oscuro el banding se ve a simple vista.
  col+=(h(gl_FragCoord.xy)-.5)/255.;

  O=vec4(col,1.);
}`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

/**
 * Arranca el fondo. Devuelve la función de limpieza, o `null` si no se pudo:
 * en ese caso el degradado CSS se queda solo, que es un respaldo, no un error.
 */
export function start(canvas: HTMLCanvasElement): (() => void) | null {
  const opts: WebGLContextAttributes = {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "low-power",
  };

  const gl = (canvas.getContext("webgl2", opts) ??
    canvas.getContext("webgl", opts)) as WebGLRenderingContext | null;
  if (!gl) return null;

  const v2 = typeof WebGL2RenderingContext !== "undefined" && gl instanceof WebGL2RenderingContext;
  const frag = v2 ? `#version 300 es\n${PREC}out vec4 O;${BODY}` : `${PREC}#define O gl_FragColor${BODY}`;

  const vs = compile(gl, gl.VERTEX_SHADER, v2 ? VERT_2 : VERT_1);
  const fs = compile(gl, gl.FRAGMENT_SHADER, frag);
  const prog = vs && fs ? gl.createProgram() : null;
  if (!vs || !fs || !prog) return null;

  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);

  // Un triángulo que cubre el viewport. Más barato que dos y sin costura.
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const uR = gl.getUniformLocation(prog, "r");
  const uT = gl.getUniformLocation(prog, "t");

  // El campo es suave: renderizar por debajo de la resolución real no se nota
  // y recorta el trabajo de la GPU a la mitad.
  const SCALE = 0.7;
  let w = 0;
  let hgt = 0;

  const resize = () => {
    const nw = Math.max(1, Math.round(canvas.clientWidth * SCALE));
    const nh = Math.max(1, Math.round(canvas.clientHeight * SCALE));
    if (nw === w && nh === hgt) return;
    w = nw;
    hgt = nh;
    canvas.width = w;
    canvas.height = hgt;
    gl.viewport(0, 0, w, hgt);
    gl.uniform2f(uR, w, hgt);
  };

  let raf = 0;
  let visible = true;
  let onScreen = true;
  const t0 = performance.now();
  let last = 0;

  // --- Medición de las primeras vueltas -------------------------------------
  // Contar núcleos es un proxy pobre: hay equipos de dos núcleos que pintan
  // esto sin despeinarse y portátiles de ocho con la GPU saturada. Lo que sí
  // dice la verdad es cuánto tarda en dibujar de verdad, en este equipo y en
  // este momento. Se descartan las primeras vueltas —compilación del shader y
  // primer pintado no son representativos— y se miden las siguientes; si no
  // llega al mínimo, se apaga y se queda el degradado CSS.
  const WARMUP = 5;
  const SAMPLE = 30;
  const MIN_FPS = 24;
  let drawn = 0;
  let sampleStart = 0;

  const frameLoop = (now: number) => {
    raf = requestAnimationFrame(frameLoop);
    // 30 fps bastan de sobra para algo que se mueve así de lento, y es la
    // mitad de trabajo para la GPU y la batería.
    if (now - last < 33) return;
    last = now;
    resize();
    gl.uniform1f(uT, (now - t0) * 0.000018);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    drawn += 1;
    if (drawn === WARMUP) {
      sampleStart = now;
    } else if (drawn === WARMUP + SAMPLE) {
      const fps = (SAMPLE * 1000) / Math.max(1, now - sampleStart);
      if (fps < MIN_FPS) {
        cleanup();
        canvas.style.display = "none";
      }
    }
  };

  const run = () => {
    const should = visible && onScreen;
    if (should && !raf) {
      last = 0;
      raf = requestAnimationFrame(frameLoop);
    } else if (!should && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };

  const onVisibility = () => {
    visible = document.visibilityState === "visible";
    run();
  };

  // Fuera de pantalla no se dibuja: el héroe queda arriba, así que en cuanto
  // alguien baja a leer, el bucle se detiene.
  const io = new IntersectionObserver(
    (entries) => {
      onScreen = entries[0]?.isIntersecting ?? true;
      run();
    },
    { threshold: 0 },
  );
  io.observe(canvas);

  // Un contexto perdido no se recupera: se apaga el canvas y el degradado CSS
  // que está debajo se queda, que es exactamente el respaldo previsto.
  const onLost = (e: Event) => {
    e.preventDefault();
    cleanup();
    canvas.style.display = "none";
  };

  let done = false;
  const cleanup = () => {
    if (done) return;
    done = true;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    io.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
    canvas.removeEventListener("webglcontextlost", onLost);
    window.removeEventListener("resize", resize);
    gl.deleteProgram(prog);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    gl.deleteBuffer(buf);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  };

  canvas.addEventListener("webglcontextlost", onLost);
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("resize", resize, { passive: true });

  resize();
  run();

  return cleanup;
}
