/**
 * Recorte de fondo verde (chroma key) en tiempo real con WebGL.
 *
 * El video se genera sobre un verde plano; cada fotograma se dibuja en un canvas con el verde
 * convertido en transparencia, así el objeto flota sobre el fondo de la página en cualquier tema.
 * Además se elimina el derrame verde (`despill`) en los bordes.
 *
 * Solo se usa en el navegador. `create` devuelve `null` si WebGL no está disponible; en ese caso
 * el llamador debe mantener su contenido de respaldo.
 */
const VERTEX = `
attribute vec2 p;
varying vec2 uv;
void main() {
  uv = vec2((p.x + 1.0) * 0.5, 1.0 - (p.y + 1.0) * 0.5);
  gl_Position = vec4(p, 0.0, 1.0);
}`;

const FRAGMENT = `
precision mediump float;
uniform sampler2D tex;
varying vec2 uv;
void main() {
  vec3 c = texture2D(tex, uv).rgb;
  float spill = c.g - max(c.r, c.b);
  float alpha = 1.0 - smoothstep(0.10, 0.34, spill);
  vec3 rgb = vec3(c.r, min(c.g, max(c.r, c.b)), c.b);
  gl_FragColor = vec4(rgb * alpha, alpha);
}`;

export class ChromaKeyRenderer {
  private constructor(
    private readonly gl: WebGLRenderingContext,
    private readonly texture: WebGLTexture,
  ) {}

  static create(canvas: HTMLCanvasElement): ChromaKeyRenderer | null {
    const gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true });
    if (!gl) return null;

    const compile = (type: number, source: string): WebGLShader | null => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
    };
    const vertex = compile(gl.VERTEX_SHADER, VERTEX);
    const fragment = compile(gl.FRAGMENT_SHADER, FRAGMENT);
    const program = gl.createProgram();
    if (!vertex || !fragment || !program) return null;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'p');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const texture = gl.createTexture();
    if (!texture) return null;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.clearColor(0, 0, 0, 0);
    return new ChromaKeyRenderer(gl, texture);
  }

  /** Dibuja el fotograma actual del video con el fondo verde transparente. */
  draw(video: HTMLVideoElement): void {
    const gl = this.gl;
    if (video.readyState < 2 || video.videoWidth === 0) return;
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}
