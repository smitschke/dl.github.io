// Get the WebGL context.
var canvas = document.getElementById('canvas');
var gl = canvas.getContext('experimental-webgl');

// Pipeline setup.
gl.clearColor(0.89, 0.92, 0.99, 1);
// Backface culling.
gl.frontFace(gl.CCW);
gl.enable(gl.CULL_FACE);
gl.cullFace(gl.BACK);

// Positions.
var vertices = new Float32Array([ 
    -0.5,1,0, -0.5,2.5,0, -1.5,1.75,0, 
    -0.6,1.2,0, -0.6,2.3,0, -1.3,1.75,0, 
    0.5,1.25,0, 0,1.75,0, -0.5,1,0,
    1,2,0, 0,1.75,0, 0.5,1.25,0, 
    -0.5,0.5,0, 0.5,0.75,0, -0.5,1.25,0,
    -0.3,0.75,0, -0.2,0.85,0, -0.3,0.95,0,
    -0.5,0.5,0, 0.25,0.5,0, 0.5,0.75,0,
    -1.5,-0.25,0, -0.5,-1.25,0, -0.5,0.75,0, //
    -0.5,-0.5,0, 0,0,0, -0.5,0.5,0,
    -0.4,-0.25,0, 0,-0.5,0, 0,0,0,
    -1.5,-1.5,0, 0.25,-2,0, -1.5,-0.25,0,
    -1.75,-0.75,0, -1.5,-1,0, -1.5,-0.5,0,
]);

    // Colors as rgba.
var colors = new Float32Array([
    0.65,0.58,0.56,1.0, 0.65,0.58,0.56,1.0, 0.65,0.58,0.56,1.0, //Ohr außen
    1,1,1,1.0, 1,1,1,1.0, 1,1,1,1.0, //Ohr innen
    0.35,0.12,0.09,1.0, 0.35,0.12,0.09,1.0, 0.35,0.12,0.09,1.0, //Ohr Rückseite Oben
    0.35,0.12,0.09,1.0, 0.35,0.12,0.09,1.0, 0.35,0.12,0.09,1.0, //Ohr Rückseite Unten
    0.65,0.58,0.56,1.0, 1,1,1,1.0, 0.65,0.58,0.56,1.0, //Kopf oben
    0,0,0,1.0, 0,0,0,1.0, 0,0,0,1.0, //Auge
    0.65,0.58,0.56,1.0, 0.65,0.58,0.56,1.0, 0.65,0.58,0.56,1.0, //Kopf unten
    0.44,0.36,0.37,1.0, 0.44,0.36,0.37,1.0, 0.65,0.58,0.56,1.0, //Körper
    0.35,0.12,0.09,1.0, 0.35,0.12,0.09,1.0, 0.35,0.12,0.09,1.0, //Pfote oben
    0.35,0.12,0.09,1.0, 0.35,0.12,0.09,1.0, 0.35,0.12,0.09,1.0, //Pfote unten
    0.44,0.36,0.37,1.0, 1,1,1,1.0, 0.44,0.36,0.37,1.0, //Bein
    0.65,0.58,0.56,1.0, 0.65,0.58,0.56,1.0, 0.65,0.58,0.56,1.0, //Schwanz
]);

// Index data.
var indices = new Uint16Array([ 
    0,1,2, 
    3,4,5, 
    6,7,8, 
    9,10,11, 
    12,13,14,
    15,16,17,
    18,19,20,
    21,22,23,
    24,25,26,
    27,28,29,
    30,31,32,
    33,34,35
]);

// Setup vertex buffer object.
var vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

var colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

var indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, indices, gl.STATIC_DRAW);
indexBuffer.numerOfEmements = indices.length;

// Compile vertex shader.
var vsSource = `
    attribute vec3 pos;
    attribute vec4 col;
    varying vec4 color;
    
    void main(){
        color = col;
        gl_Position = vec4(pos*0.3, 1);
    }`;
var vs = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vs, vsSource);
gl.compileShader(vs);

// Compile fragment shader.
fsSouce = `
    precision mediump float;
    varying vec4 color;
    
    void main() {
        gl_FragColor = color;
    }`;
var fs = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fs, fsSouce);
gl.compileShader(fs);

// Link shader together into a program.
var prog = gl.createProgram();
gl.attachShader(prog, vs);
gl.attachShader(prog, fs);
gl.linkProgram(prog);

var posAttrib = gl.getAttribLocation(prog, 'pos');
gl.enableVertexAttribArray(posAttrib);
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.vertexAttribPointer(posAttrib, 3, gl.FLOAT, false, 0, 0);

var colAttrib = gl.getAttribLocation(prog, 'col');
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.vertexAttribPointer(colAttrib, 4, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(colAttrib);

gl.clear(gl.COLOR_BUFFER_BIT);

gl.useProgram(prog);
gl.drawArrays(gl.TRIANGLES, 0, indexBuffer.numerOfEmements);

//Quellen-Anzeige
$(document).ready(function() {
$("#source_link").on("click", function(event) {
    $('#sources').show();
  });
  
  $("#close").on("click", function(event) {
    $('#sources').hide();
  });
});