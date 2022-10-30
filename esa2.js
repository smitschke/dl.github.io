// Get the WebGL context.
var canvas = document.getElementById('canvas');
var gl = canvas.getContext('experimental-webgl');

// Pipeline setup.
gl.clearColor(0.89, 0.92, 0.99, 1);
// Backface culling.
gl.frontFace(gl.CCW);
gl.enable(gl.CULL_FACE);
gl.cullFace(gl.BACK);

// Compile vertex shader.
var vsSource = 'attribute vec2 pos;'+
    'void main(){ gl_Position = vec4(pos * 0.3 , 0, 1); }';
var vs = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vs, vsSource);
gl.compileShader(vs);

// Compile fragment shader.
//Farbe Blume
fsSouce =  'void main() { gl_FragColor = vec4(0.66,0.25,0.64,1.0); }';
var fs = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fs, fsSouce);
gl.compileShader(fs);

// Link shader together into a program.
var prog = gl.createProgram();
gl.attachShader(prog, vs);
gl.attachShader(prog, fs);
gl.linkProgram(prog);
gl.useProgram(prog);

var buffer = new ArrayBuffer(512);
var vertices = new Float32Array(buffer);

var vcounter = 0.0;
for (var i = 0; i < vertices.length; i++) {
    vcounter = Math.floor(vcounter * 100) / 100;
    if (i % 2 == 0) {
        if (vcounter <= 2) {
            vertices[i] = 1 - vcounter;
        } else {
            vertices[i] = -3 + vcounter;
        }

    } else {
        if (vcounter <= 1) {
            vertices[i] = 0 + vcounter;
        } else if (vcounter <= 3) {
            vertices[i] = 2 - vcounter;
        } else {
            vertices[i] = -4 + vcounter;
        }
        vcounter = vcounter + 0.1;
    }

    if(i==0) {
        vertices[i] = 0;
    }
}

var vertices2 = new Float32Array([ //
    0,1, 0,2, 0,3, 0,4, 0,5, 0,6, 0,5, 2.5,7, 0,5 ]);

var buffer = new ArrayBuffer(256);
var indices = new Uint16Array(buffer);

var icounter = 0;
for (var i = 0; i < 82; i++) {
    if (i % 2 == 0) {
        indices[i] = 0;
    } else {
        indices[i] = icounter;
        icounter += 1;
    }
}

// Setup vertex buffer object.
var vbo = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

// Connect vertex buffer to attribute variable.
var posAttrib = gl.getAttribLocation(prog, 'pos');
gl.vertexAttribPointer(posAttrib, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(posAttrib);

// Setup index buffer object.
var ibo = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, 
    gl.STATIC_DRAW);
ibo.numerOfEmements = indices.length;

// Clear framebuffer and render primitives.
gl.clear(gl.COLOR_BUFFER_BIT);
gl.drawElements(gl.LINES, ibo.numerOfEmements,
gl.UNSIGNED_SHORT, 0);

// Compile vertex shader.
var vsSource = 'attribute vec2 pos;'+
    'void main(){ gl_Position = vec4(pos * 0.3, 0, 1); }';
var vs = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vs, vsSource);
gl.compileShader(vs);

// Compile fragment shader.
fsSouce2 =  'void main() { gl_FragColor = vec4(0,0.21,0.056,1.0); }';
var fs2 = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fs2, fsSouce2);
gl.compileShader(fs2);

// Link shader together into a program.
var prog2 = gl.createProgram();
gl.attachShader(prog2, vs);
gl.attachShader(prog2, fs2);
gl.linkProgram(prog2);
gl.useProgram(prog2);

var vertices2 = new Float32Array([0,0, -0.15,-2, 0.2,-1.4, 0.5,-1.2, 0.4,-1.6, -0.15,-2, -0.2,-2.8]);

gl.bufferData(gl.ARRAY_BUFFER, vertices2, gl.STATIC_DRAW);

// Bind vertex buffer to attribute variable
var posAttrib = gl.getAttribLocation(prog2, 'pos');
gl.vertexAttribPointer(posAttrib, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(posAttrib);

// Clear framebuffer and render primitives
gl.drawArrays(gl.LINE_STRIP, 0, 7);


//Quellen-Anzeige
$(document).ready(function() {
$("#source_link").on("click", function(event) {
    console.log("test");
    $('#sources').show();
  });
  
  $("#close").on("click", function(event) {
    $('#sources').hide();
  });
});