var shpere = ( function() {

    function createVertexData(){
        var recDepth = document.getElementById('recDepth').value;

		var vector = function(x,y,z) {
			return {
				x: x,
				y: y,
				z: z
			}
		}

		var normalize = function(vec) {
			var length = Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z);
			return vector(vec.x / length, vec.y / length, vec.z / length);
		}

        var calculateCenter = function(p1,p2){
            var center = vector((p1.x+p2.x)/2, (p1.y+p2.y)/2, (p1.z+p2.z)/2);
            points.push(normalize(center));
            return points.length-1;
        };

        var points = [];
        var triangles = [];

        // starting points
		points.push(normalize(vector( 0, -1,  0)));
		points.push(normalize(vector(-1,  0,  1)));
		points.push(normalize(vector( 1,  0,  1)));
		points.push(normalize(vector( 1,  0, -1)));
		points.push(normalize(vector(-1,  0, -1)));
		points.push(normalize(vector( 0,  1,  0)));

        // starting triangles
        triangles.push(vector(0, 2, 1));
        triangles.push(vector(0, 3, 2));
        triangles.push(vector(0, 4, 3));
        triangles.push(vector(0, 1, 4));
        triangles.push(vector(1, 2, 5));
        triangles.push(vector(2, 3, 5));
        triangles.push(vector(3, 4, 5));
        triangles.push(vector(4, 1, 5));

        var newTriangles = triangles;
        var currentLength = triangles.length;
        for(var i = 0; i < recDepth; i++){
			console.log(recDepth);
            
            for(var d = 0; d < currentLength; d++){
                var currentTriangle = triangles[d];

                var p1 = calculateCenter(points[currentTriangle.x],points[currentTriangle.y]);
                var p2 = calculateCenter(points[currentTriangle.y],points[currentTriangle.z]);
                var p3 = calculateCenter(points[currentTriangle.x],points[currentTriangle.z]);

                newTriangles.push(vector(currentTriangle.x, p1, p3));
                newTriangles.push(vector(p1, currentTriangle.y, p2));
                newTriangles.push(vector(p3, p2, currentTriangle.z));
                newTriangles.push(vector(p1, p2, p3));
            }
            currentLength = newTriangles.length;
        }
        triangles = newTriangles;

		// Positions.
		this.vertices = new Float32Array(3 * points.length);
		var vertices = this.vertices;
		// Normals.
		this.normals = new Float32Array(3 * points.length);
		var normals = this.normals;
		// Index data.
		this.indicesLines = new Uint16Array(6 * triangles.length);
		var indicesLines = this.indicesLines;
		this.indicesTris = new Uint16Array(3 * triangles.length);
		var indicesTris = this.indicesTris;

		for (var i = 0; i < points.length; i++){
            // verts
			vertices[i * 3]     = points[i].x*0.5;
			vertices[i * 3 + 1] = points[i].y*0.5;
			vertices[i * 3 + 2] = points[i].z*0.5;

            // normals
			normals[i * 3]     = points[i].x;
			normals[i * 3 + 1] = points[i].y;
			normals[i * 3 + 2] = points[i].z;
		}

		for (var i = 0; i < triangles.length; i++){
			indicesLines[i * 6]     = triangles[i].x;
			indicesLines[i * 6 + 1] = triangles[i].y;
			indicesLines[i * 6 + 2] = triangles[i].y;
			indicesLines[i * 6 + 3] = triangles[i].z;
			indicesLines[i * 6 + 4] = triangles[i].x;
			indicesLines[i * 6 + 5] = triangles[i].z;
            
			indicesTris[i * 3]     = triangles[i].x;
			indicesTris[i * 3 + 1] = triangles[i].y;
			indicesTris[i * 3 + 2] = triangles[i].z;
		}
    }   

	return {
		createVertexData : createVertexData
	}

}());