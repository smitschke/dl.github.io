var ear = ( function() {

	var res = 20;

	function createVertexData() {
		this.res = res;
		var n = this.res;
		var m = this.res;

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

		var du = Math.PI / n;
		var dv = 2 * Math.PI / m;
		var a = 2;
		var b = 1;
		// Counter for entries in index array.
		var iLines = 0;
		var iTris = 0;

		// Loop angle u.
		for(var i = 0, u = 0; i <= n; i++, u += du) {
			// Loop angle v.
			for(var j = 0, v = 0; j <= m; j++, v += dv) {

				var iVertex = i * (m + 1) + j;

				//var x = Math.exp(b * v) * Math.cos(v) + Math.exp(a * v) * Math.cos(u) * Math.cos(v);
				//var z = Math.exp(b * v) * Math.sin(v) + Math.exp(a * v) * Math.cos(u) * Math.cos(v);
				//var y = Math.exp(a * v) * Math.sin(u);
				var x = (1-Math.cosh(u)) * Math.sin(u) * Math.cos(v)/2;
				var y = (1-Math.cosh(u)) * Math.sin(u) * Math.sin(v)/2;
				var z = Math.cosh(u);

				// Set vertex positions.
				vertices[iVertex * 3] = x;
				vertices[iVertex * 3 + 1] = y;
				vertices[iVertex * 3 + 2] = z;

				// Calc and set normals.
				var vertexLength = Math.sqrt(x * x + y * y + z * z);
				var nx = x / vertexLength;
				var ny = y / vertexLength;
				var nz = z / vertexLength;
				normals[iVertex * 3] = nx;
				normals[iVertex * 3 + 1] = ny;
				normals[iVertex * 3 + 2] = nz;

				// Set index.
				// Line on beam.
				if(j > 0 && i > 0) {
					indicesLines[iLines++] = iVertex - 1;
					indicesLines[iLines++] = iVertex;
				}
				// Line on ring.
				if(j > 0 && i > 0) {
					indicesLines[iLines++] = iVertex - (m + 1);
					indicesLines[iLines++] = iVertex;
				}

				// Set index.
				// Two Triangles.
				if(j > 0 && i > 0) {
					indicesTris[iTris++] = iVertex;
					indicesTris[iTris++] = iVertex - 1;
					indicesTris[iTris++] = iVertex - (m + 1);
					//
					indicesTris[iTris++] = iVertex - 1;
					indicesTris[iTris++] = iVertex - (m + 1) - 1;
					indicesTris[iTris++] = iVertex - (m + 1);
				}
			}
		}
	}

	return {
		createVertexData : createVertexData
	}

}());