var shell = ( function() {

	function createVertexData() {
		var n = 31;
		var m = 30;

		// Positions.
		this.vertices = new Float32Array(3 * (n + 1) * (m + 1));
		var vertices = this.vertices;
		// Normals.
		this.normals = new Float32Array(3 * (n + 1) * (m + 1));
		var normals = this.normals;
		// Index data.
		this.indicesLines = new Uint16Array(2 * 2 * n * m);
		var indicesLines = this.indicesLines;
		this.indicesTris = new Uint16Array(3 * 2 * n * m);
		var indicesTris = this.indicesTris;
		
        var dv = 2 / n;
  var du = 2 / m;
  var a = 0.25;
  var b = 1;
  var c = 0;
  var w = 3

  var iLines = 0;
  var iTris = 0;

  for (var j = 0, v = 0; j <= m; j++, v += dv) {


  for (var i = 0, u = 0; i <= n; i++, u += du) {

    
      var iVertex = i*(m+1) + j;

      var h = 1 - 0.5 * v;
      var x = a * h * Math.cos(w * v * Math.PI) * (1 + Math.cos(u * Math.PI)) + c * Math.cos(w * v * Math.PI);
      var z = a * h * Math.sin(w * v * Math.PI) * (1 + Math.cos(u * Math.PI)) + c * Math.sin(w * v * Math.PI);
      var y = (b * 0.5 * v + a * h * Math.sin(u * Math.PI)) - .3;

				// Set vertex positions
				vertices[iVertex * 3] = x +1 ;
				vertices[iVertex * 3 + 1] = y;
				vertices[iVertex * 3 + 2] = z ;
				
				// Calc and set normals.
				var nx = Math.cos(u) * Math.cos(v);
				var ny = Math.cos(u) * Math.sin(v);
				var nz = Math.sin(u);
				normals[iVertex * 3] = nx;
				normals[iVertex * 3 + 1] = ny;
				normals[iVertex * 3 + 2] = nz;

				// Set index
				if (j > 0 && i > 0) {
					indicesLines[iLines++] = iVertex - 1;
					indicesLines[iLines++] = iVertex;
				}

				if (j > 0 && i > 0) {
					indicesLines[iLines++] = iVertex - (m + 1);
					indicesLines[iLines++] = iVertex;
				}

				// Set index.
				// Two Triangles.
				if(j>0 && i>0){
					indicesTris[iTris++] = iVertex;
					indicesTris[iTris++] = iVertex - 1;
					indicesTris[iTris++] = iVertex - (m+1);
					//							
					indicesTris[iTris++] = iVertex - 1;
					indicesTris[iTris++] = iVertex - (m+1) - 1;							
					indicesTris[iTris++] = iVertex - (m+1);							
				}
			}
		}
	}

	return {
		createVertexData : createVertexData
	}

}());
