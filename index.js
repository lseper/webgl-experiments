import resizeCanvasToDisplaySize from './webglutils.js';

const canvas = document.querySelector('#c');
const gl = canvas.getContext('webgl2');
if (!gl) {
    console.error('WebGL2 not supported :(');
}

const vertexShaderSource = `#version 300 es
 
// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec2 a_position;

uniform vec2 u_resolution;
 
// all shaders have a main function
void main() {
    // zero to one (instead of -1, 1) -> 0.0 - 1.0
    vec2 zeroToOne = a_position / u_resolution;
    // now convert from 0.0->1.0 to 0.0->2.0
    vec2 zeroToTwo = zeroToOne * 2.0;
    // convert from 0->2 to -1->+1 (clipspace)
    vec2 clipSpace = zeroToTwo - 1.0;
    // gl_Position is a special variable a vertex shader (and multiply by (1, -1) to flip y)
    gl_Position = vec4(clipSpace * vec2(1.0, -1.0), 0.0, 1.0);
}
`;

const fragmentShaderSource = `#version 300 es
 
// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;

// uniform is a way to pass data from our JavaScript to our shaders
uniform vec4 u_color;
 
// we need to declare an output for the fragment shader
out vec4 outColor;
 
void main() {
  outColor = u_color;
}
`

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
      return shader;
    }
   
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
  }

function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
      return program;
    }
   
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
  }

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

const program = createProgram(gl, vertexShader, fragmentShader);

// now we can supply data to shader

const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
const colorLocation = gl.getUniformLocation(program, "u_color");

const positionBuffer = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

const vao = gl.createVertexArray();
gl.bindVertexArray(vao);

gl.enableVertexAttribArray(positionAttributeLocation);

const size = 2;          // 2 components per iteration
const type = gl.FLOAT;   // the data is 32bit floats
const normalize = false; // don't normalize the data
const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
const offset = 0;        // start at the beginning of the buffer
gl.vertexAttribPointer(
    positionAttributeLocation, size, type, normalize, stride, offset) // the current attribute is bound to this (i.e. positionBuffer)
    // so we can then bind a different value to gl.ARRAY_BUFFER and it will be used for the current attribute

// canvas resize
resizeCanvasToDisplaySize(gl.canvas);
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

// set default clear color
gl.clearColor(0, 0, 0, 0);
gl.clear(gl.COLOR_BUFFER_BIT);

// tell it to use our program (pair of shaders)
gl.useProgram(program);

function drawTriangle1() {
    // bind the attribute/buffer set we want to use to pull data out gpu side
    gl.bindVertexArray(vao);
    
    // now execute our program
    const primitiveType = gl.TRIANGLES;
    const offsetDraw = 0;
    const count = 3;
    gl.drawArrays(primitiveType, offsetDraw, count);
}

function drawRectangle1() {
    // Pass in the canvas resolution so we can convert from
    // pixels to clip space in the shader
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
    // draw
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 6; // six vertices in two triangles that make up rectangle
    gl.drawArrays(primitiveType, offset, count);
}

function setRectangle(gl, x, y, width, height) {
    const x1 = x
    const x2 = x + width;
    const y1 = y;
    const y2 = y + height;

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        x1, y1,
        x2, y1,
        x1, y2,
        x1, y2,
        x2, y1,
        x2, y2,
    ]), gl.STATIC_DRAW);
}

function randomInt(range) {
    return Math.floor(Math.random() * range);
}

function drawRectangles2(num_rectangles) {
    console.log('drawRectangles2');
    for (let i = 0; i < num_rectangles; i++) {
        setRectangle(gl, randomInt(300), randomInt(300), randomInt(300), randomInt(300));
        // set color
        gl.uniform4f(colorLocation, Math.random(), Math.random(), Math.random(), 1);
        // draw
        const primitiveType = gl.TRIANGLES;
        // Pass in the canvas resolution so we can convert from
        // pixels to clip space in the shader
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
        // draw
        var offset = 0;
        var count = 6; // six vertices in two triangles that make up rectangle
        gl.drawArrays(primitiveType, offset, count);
    }
}

drawRectangles2(50);

