function renderShell(display_lines){
  // Get the WebGL context.
  var canvas = document.getElementById('shell');
  var gl = canvas.getContext('experimental-webgl');

  // Pipeline setup.
  gl.clearColor(.90, .84, .75, 1);
  // Backface culling.
  gl.frontFace(gl.CCW);
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);
  // Depth(Z)-Buffer.
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.enable(gl.POLYGON_OFFSET_FILL);
  gl.polygonOffset(1.0, 1.0);


  // Compile vertex shader. 
  var vsSource = '' + 
  'attribute vec3 pos;' + 
  'attribute vec4 col;' + 
  'varying vec4 color;' + 
  'void main(){' + 'color = col;' + 
  'gl_Position = vec4(pos, 1);' +
  '}';
  var vs = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vs, vsSource);
  gl.compileShader(vs);

  // Compile fragment shader.
  fsSouce = 'precision mediump float;' + 
  'varying vec4 color;' + 
  'void main() {' + 
  'gl_FragColor = color;' + 
  '}';
  var fs = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fs, fsSouce);
  gl.compileShader(fs);

  // Link shader together into a program.
  var prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.bindAttribLocation(prog, 0, "pos");
  gl.linkProgram(prog);
  gl.useProgram(prog);

  // Vertex data.
  // Positions, Index data.
  var vertices, colors, indicesLines, indicesTris;
  // Fill the data arrays.

  var n = 31;
  var m = 30

  // Positions.
  vertices = new Float32Array(3*(n+1)*(m+1));
  // Colors.
  colors = new Float32Array(3 * (n + 1) * (m + 1));
  // Index data
  indicesLines = new Uint16Array(2 * 2 * n * m);
  indicesTris  = new Uint16Array(3 * 2 * n * m);

  var dv = 2 / n;
  var du = 2 / m;

  var a = 0.25;
  if(document.getElementById('a_shell').value) {
    a = document.getElementById('a_shell').value;
  }

  var b = 1;
  if(document.getElementById('b_shell').value) {
    b = document.getElementById('b_shell').value;
  }
    
  var c = 0;
  if(document.getElementById('c_shell').value) {
    c = document.getElementById('c_shell').value;
  }
    
  //console.log(document.getElementById('n_shell').value);
  var w = 3
  if(document.getElementById('w_shell').value) {
    w = document.getElementById('w_shell').value;
  }

  var iLines = 0;
  var iTris = 0;

  for (var i = 0, u = 0; i <= n; i++, u += du) {

    for (var j = 0, v = 0; j <= m; j++, v += dv) {

      var iVertex = i*(m+1) + j;

      var h = 1 - 0.5 * v;
      var x = a * h * Math.cos(w * v * Math.PI) * (1 + Math.cos(u * Math.PI)) + c * Math.cos(w * v * Math.PI);
      var z = a * h * Math.sin(w * v * Math.PI) * (1 + Math.cos(u * Math.PI)) + c * Math.sin(w * v * Math.PI);
      var y = (b * 0.5 * v + a * h * Math.sin(u * Math.PI)) - .3;

      // Set vertex positions.
      vertices[iVertex * 3] = x;
      vertices[iVertex * 3 + 1] = y;
      vertices[iVertex * 3 + 2] = z;

      // Calc and set normals.
      var vertexLength = Math.sqrt(x * x + y * y + z * z);
      
      colors[iVertex * 3] = 0.15 / vertexLength;
      colors[iVertex * 3 + 1] = y / vertexLength;
      colors[iVertex * 3 + 2] = 0.2 / vertexLength;

      if (j > 0 && i > 0) {
        indicesLines[iLines++] = iVertex - 1;
        indicesLines[iLines++] = iVertex;
      }

      if (i > 0) {
        indicesLines[iLines++] = iVertex - (m + 1);
        indicesLines[iLines++] = iVertex;
      }

      if (j > 0 && i > 0) {
        indicesTris[iTris++] = iVertex;
        indicesTris[iTris++] = iVertex - 1;
        indicesTris[iTris++] = iVertex - (m + 1);
                
        indicesTris[iTris++] = iVertex - 1;
        indicesTris[iTris++] = iVertex - (m + 1) - 1;
        indicesTris[iTris++] = iVertex - (m + 1);
      }
    }
  }

  // Setup position vertex buffer object.
  var vboPos = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vboPos);
  gl.bufferData(gl.ARRAY_BUFFER,
  vertices, gl.STATIC_DRAW);
  // Bind vertex buffer to attribute variable.
  var posAttrib = gl.getAttribLocation(prog, 'pos');
  gl.vertexAttribPointer(posAttrib, 3, gl.FLOAT,
  false, 0, 0);
  gl.enableVertexAttribArray(posAttrib);

  // Setup normal vertex buffer object.
  var vboNormal = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vboNormal);
  gl.bufferData(gl.ARRAY_BUFFER,
  colors, gl.STATIC_DRAW);
  // Bind buffer to attribute variable.
  var colAttrib = gl.getAttribLocation(prog, 'col');
  gl.vertexAttribPointer(colAttrib, 3, gl.FLOAT,
  false, 0, 0);
  gl.enableVertexAttribArray(colAttrib);

  // Setup constant color.
  //var colAttrib = gl.getAttribLocation(prog, 'col');

  // Setup lines index buffer object.
  var iboLines = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboLines);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
  indicesLines, gl.STATIC_DRAW);
  iboLines.numberOfElements = indicesLines.length;
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  // Setup tris index buffer object.
  var iboTris = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboTris);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
  indicesTris, gl.STATIC_DRAW);
  iboTris.numberOfElements = indicesTris.length;
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  // Clear framebuffer and render primitives.
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Setup rendering tris.
  //gl.vertexAttrib4f(colAttrib, 0.42, 0.3, 0.74, 1);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboTris);
  gl.drawElements(gl.TRIANGLES,
  iboTris.numberOfElements, gl.UNSIGNED_SHORT, 0);
   
  // Setup rendering lines.
  if(display_lines) {
    gl.disableVertexAttribArray(colAttrib);
    gl.vertexAttrib4f(colAttrib, 0, 0, 0, 1);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboLines);
    gl.drawElements(gl.LINES,
    iboLines.numberOfElements, gl.UNSIGNED_SHORT, 0);
  }
}
