var app = (function() {

    var gl;

    // The shader program object is also used to
    // store attribute and uniform locations.
    var prog;

    // Array of model objects.
    var models = [];

    // Model that is target for user input.
    var interactiveModel;

    var camera = {
        // Initial position of the camera.
        eye : [ 0, 1, 4],
        // Point to look at.
        center : [ 0, .5, 0 ],
        // Roll and pitch of the camera.
        up : [ 0, 1, 0 ],
        // Opening angle given in radian.
        // radian = degree*2*PI/360.
        fovy : 60.0 * Math.PI / 180,
        // Camera near plane dimensions:
        // value for left right top bottom in projection.
        lrtb : 2.0,
        // View matrix.
        vMatrix : mat4.create(),
        // Projection matrix.
        pMatrix : mat4.create(),
        // Projection types: ortho, perspective, frustum.
        projectionType : "perspective",
        // Angle to Z-Axis for camera when orbiting the center
        // given in radian.
        xAngle: 0,
        yAngle: 0,
        zAngle : 0,

        // Distance in XZ-Plane from center when orbiting.
        distance : 4,
    };


    // Objekt with light sources characteristics in the scene.
    var illumination = {
        ambientLight : [ .5, .5, .5 ],
        light : [ 
            {isOn : true, position : [ 3., 1., 3. ], color : [ 1., 1., 1. ]},
            {isOn : true, position : [ -3., 1., -3. ], color : [ 1., 1., 1. ]},
         ]
    };

    function start() {
        init();
        render();
    }

    function init() {
        initWebGL();
        initShaderProgram();
        initUniforms();
        initModels();
        initEventHandler();
        initPipline();
    }

    function initWebGL() {
        // Get canvas and WebGL context.
        canvas = document.getElementById('canvas');
        gl = canvas.getContext('experimental-webgl');
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    }

    /**
     * Init pipeline parmters that will not change again. If projection or
     * viewport change, thier setup must be in render function.
     */
    function initPipline() {
        gl.clearColor(.95, .95, .95, 1);

        // Backface culling.
        gl.frontFace(gl.CCW);
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);

        // Depth(Z)-Buffer.
        gl.enable(gl.DEPTH_TEST);

        // Polygon offset of rastered Fragments.
        gl.enable(gl.POLYGON_OFFSET_FILL);
        gl.polygonOffset(0.5, 0);

        // Set viewport.
        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

        // Init camera.
        // Set projection aspect ratio.
        camera.aspect = gl.viewportWidth / gl.viewportHeight;
    }

    function initShaderProgram() {
        // Init vertex shader.
        var vs = initShader(gl.VERTEX_SHADER, "vertexshader");
        // Init fragment shader.
        var fs = initShader(gl.FRAGMENT_SHADER, "fragmentshader");
        // Link shader into a shader program.
        prog = gl.createProgram();
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        gl.bindAttribLocation(prog, 0, "aPosition");
        gl.linkProgram(prog);
        gl.useProgram(prog);
    }

    /**
     * Create and init shader from source.
     * 
     * @parameter shaderType: openGL shader type.
     * @parameter SourceTagId: Id of HTML Tag with shader source.
     * @returns shader object.
     */
    function initShader(shaderType, SourceTagId) {
        var shader = gl.createShader(shaderType);
        var shaderSource = document.getElementById(SourceTagId).text;
        gl.shaderSource(shader, shaderSource);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.log(SourceTagId + ": " + gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    }

    function initUniforms() {
        // Projection Matrix.
        prog.pMatrixUniform = gl.getUniformLocation(prog, "uPMatrix");

        // Model-View-Matrix.
        prog.mvMatrixUniform = gl.getUniformLocation(prog, "uMVMatrix");

        // Normal Matrix.
        prog.nMatrixUniform = gl.getUniformLocation(prog, "uNMatrix");

        // Color.
        prog.colorUniform = gl.getUniformLocation(prog, "uColor");

        // Light.
        prog.ambientLightUniform = gl.getUniformLocation(prog,
                "ambientLight");
        // Array for light sources uniforms.
        prog.lightUniform = [];
        // Loop over light sources.
        for (var j = 0; j < illumination.light.length; j++) {
            var lightNb = "light[" + j + "]";
            // Store one object for every light source.
            var l = {};
            l.isOn = gl.getUniformLocation(prog, lightNb + ".isOn");
            l.position = gl.getUniformLocation(prog, lightNb + ".position");
            l.color = gl.getUniformLocation(prog, lightNb + ".color");
            prog.lightUniform[j] = l;
        }

        // Material.
        prog.materialKaUniform = gl.getUniformLocation(prog, "material.ka");
        prog.materialKdUniform = gl.getUniformLocation(prog, "material.kd");
        prog.materialKsUniform = gl.getUniformLocation(prog, "material.ks");
        prog.materialKeUniform = gl.getUniformLocation(prog, "material.ke");
    }

    /**
     * @paramter material : objekt with optional ka, kd, ks, ke.
     * @return material : objekt with ka, kd, ks, ke.
     */
    function createPhongMaterial(material) {
        material = material || {};
        // Set some default values,
        // if not defined in material paramter.
        material.ka = material.ka || [ 0.3, 0.3, 0.3 ];
        material.kd = material.kd || [ 0.6, 0.6, 0.6 ];
        material.ks = material.ks || [ 0.8, 0.8, 0.8 ];
        material.ke = material.ke || 10.;

        return material;
    }

    function initModels() {
        // fillstyle
        var fs = "fill";

        // Create some default material.
        var mDefault = createPhongMaterial();
   

        createModel("torus", fs, [ 1, 1, 1, 1 ], [ 0, .75, 0 ],
                [ 0, 0, 0, 0 ], [ 1, 1, 1, 1 ], createPhongMaterial({kd: [1.0, .0, .0]}));
        createModel("sphere", fs, [ 1, 1, 1, 1 ], [ -1.25, .5, 0 ], [ 0, 0, 0, 0 ], [ .5, .5, .5 ], 
            createPhongMaterial({kd: [.0, 1.0, .0]}));
        createModel("sphere", fs, [ 1, 1, 1, 1 ], [ 1.25, .5, 0 ], [ 0, 0, 0, 0 ], [ .5, .5, .5 ], 
            createPhongMaterial({kd: [.0, .0, 1.0]}));
        createModel("plane", fs, [ 1, 1, 1, 1 ], [ 0, 0, 0, 0 ], [ 0, 0, 0, 0 ], [ 1, 1, 1, 1 ], 
                    createPhongMaterial({ka: [1.0, 1.0, 1.0], kd: [.5, .5, .5], ks: [.0, .0, .0]}));

        // Select one model that can be manipulated interactively by user.
        interactiveModel = models[0];
    }

    /**
     * Create model object, fill it and push it in models array.
     * 
     * @parameter geometryname: string with name of geometry.
     * @parameter fillstyle: wireframe, fill, fillwireframe.
     */
    function createModel(geometryname, fillstyle, color, translate, rotate,
            scale, material) {
        var model = {};
        model.fillstyle = fillstyle;
        model.color = color;
        initDataAndBuffers(model, geometryname);
        initTransformations(model, translate, rotate, scale);
        model.material = material;

        models.push(model);
    }

    /**
     * Set scale, rotation and transformation for model.
     */
    function initTransformations(model, translate, rotate, scale) {
        // Store transformation vectors.
        model.translate = translate;
        model.rotate = rotate;
        model.scale = scale;

        // Create and initialize Model-Matrix.
        model.mMatrix = mat4.create();

        // Create and initialize Model-View-Matrix.
        model.mvMatrix = mat4.create();

        // Create and initialize Normal Matrix.
        model.nMatrix = mat3.create();
    }

    /**
     * Init data and buffers for model object.
     * 
     * @parameter model: a model object to augment with data.
     * @parameter geometryname: string with name of geometry.
     */
    function initDataAndBuffers(model, geometryname) {
        // Provide model object with vertex data arrays.
        // Fill data arrays for Vertex-Positions, Normals, Index data:
        // vertices, normals, indicesLines, indicesTriangles;
        // Pointer this refers to the window.
        this[geometryname]['createVertexData'].apply(model);

        // Setup position vertex buffer object.
        model.vboPos = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, model.vboPos);
        gl.bufferData(gl.ARRAY_BUFFER, model.vertices, gl.STATIC_DRAW);
        // Bind vertex buffer to attribute variable.
        prog.positionAttrib = gl.getAttribLocation(prog, 'aPosition');
        gl.enableVertexAttribArray(prog.positionAttrib);

        // Setup normal vertex buffer object.
        model.vboNormal = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, model.vboNormal);
        gl.bufferData(gl.ARRAY_BUFFER, model.normals, gl.STATIC_DRAW);
        // Bind buffer to attribute variable.
        prog.normalAttrib = gl.getAttribLocation(prog, 'aNormal');
        gl.enableVertexAttribArray(prog.normalAttrib);

        // Setup lines index buffer object.
        model.iboLines = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.iboLines);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, model.indicesLines,
                gl.STATIC_DRAW);
        model.iboLines.numberOfElements = model.indicesLines.length;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        // Setup triangle index buffer object.
        model.iboTriangles = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.iboTriangles);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, model.indicesTriangles,
                gl.STATIC_DRAW);
        model.iboTriangles.numberOfElements = model.indicesTriangles.length;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }

    function initEventHandler() {
        // Rotation step for models.
        var lightRotation = 0;
        var deltaRotate = Math.PI / 36;
        var deltaTranslate = 0.05;
        var deltaScale = 0.05;
        var r = 1;
        var cameraXOffset = camera.center[0];
		var cameraYOffset = camera.center[1];
		var cameraZOffset = camera.center[2];

        window.onkeydown = function(evt) {
            var key = evt.which ? evt.which : evt.keyCode;
            var c = String.fromCharCode(key);
            // console.log(evt);
            // Use shift key to change sign.
            var sign = evt.shiftKey ? -1 : 1;
            // Change projection of scene.
            switch (c) {
            case ('O'):
                camera.projectionType = "ortho";
                camera.lrtb = 2;
                break;
            case ('F'):
                camera.projectionType = "frustum";
                camera.lrtb = 1.2;
                break;
            case ('P'):
                camera.projectionType = "perspective";
                break;
            }
            // Camera move and orbit.
            switch (c) {
            case ('C'):
                // Orbit camera.
                camera.zAngle += sign * deltaRotate;
                break;
            case ('H'):
                // Move camera up and down.
                camera.eye[1] += sign * deltaTranslate;
                break;
            case ('N'):
                // Camera distance to center.
                camera.distance += sign * deltaTranslate;
                break;
            case ('V'):
                // Camera fovy in radian.
                camera.fovy += sign * 5 * Math.PI / 180;
                break;
            case ('B'):
                // Camera near plane dimensions.
                camera.lrtb += sign * 0.1;
                break;
            }
            switch (c) {
                case ('I'):
                    illumination.light[0].position[0] += r * Math.cos(lightRotation);
                    illumination.light[0].position[2] += r * Math.sin(lightRotation);

                    illumination.light[1].position[0] += r * Math.cos(Math.PI + lightRotation);
                    illumination.light[1].position[2] += r * Math.sin(Math.PI + lightRotation);
                    lightRotation += deltaRotate;
                    break;
                case ('L'):
                    illumination.light[0].position[0] -= r * Math.cos(lightRotation);
                    illumination.light[0].position[2] -= r * Math.sin(lightRotation);

                    illumination.light[1].position[0] -= r * Math.cos(Math.PI + lightRotation);
                    illumination.light[1].position[2] -= r * Math.sin(Math.PI + lightRotation);
                    lightRotation -= deltaRotate;
                    break;
            }
            switch(c) {
				case('Z'):
					cameraReset();
					break;
				case('N'):
					camera.distance += sign * deltaTranslate;
					break;
				case('D'):
					cameraXOffset -= deltaRotate;
					camera.center = [cameraXOffset, cameraYOffset, cameraZOffset];
					break;
				case('A'):
					cameraXOffset += deltaRotate;
					camera.center = [cameraXOffset, cameraYOffset, cameraZOffset];
					break;
				case('W'):
					cameraYOffset -= deltaRotate;
					camera.center = [cameraXOffset, cameraYOffset, cameraZOffset];
					break;
				case('S'):
					cameraYOffset += deltaRotate;
					camera.center = [cameraXOffset, cameraYOffset, cameraZOffset];
					break;
			}


            // Render the scene again on any key pressed.
            render();
        };
    }

    /**
     * Run the rendering pipeline.
     */
    function render() {
        // Clear framebuffer and depth-/z-buffer.
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        setProjection();

        calculateCameraOrbit();

        // Set view matrix depending on camera.
        mat4.lookAt(camera.vMatrix, camera.eye, camera.center, camera.up);

        // NEW
        // Set light uniforms.
        gl.uniform3fv(prog.ambientLightUniform, illumination.ambientLight);
        // Loop over light sources.
        for (var j = 0; j < illumination.light.length; j++) {
            // bool is transferred as integer.
            gl.uniform1i(prog.lightUniform[j].isOn,
                    illumination.light[j].isOn);
            // Tranform light postion in eye coordinates.
            // Copy current light position into a new array.
            var lightPos = [].concat(illumination.light[j].position);
            // Add homogenious coordinate for transformation.
            lightPos.push(1.0);
            vec4.transformMat4(lightPos, lightPos, camera.vMatrix);
            // Remove homogenious coordinate.
            lightPos.pop();
            gl.uniform3fv(prog.lightUniform[j].position, lightPos);
            gl.uniform3fv(prog.lightUniform[j].color,
                    illumination.light[j].color);
        }

        // Loop over models.
        for (var i = 0; i < models.length; i++) {
            // Update modelview for model.
            updateTransformations(models[i]);

            // Set uniforms for model.
            //
            // Transformation matrices.
            gl.uniformMatrix4fv(prog.mvMatrixUniform, false,
                    models[i].mvMatrix);
            gl.uniformMatrix3fv(prog.nMatrixUniform, false,
                    models[i].nMatrix);
            // Color (not used with lights).
            gl.uniform4fv(prog.colorUniform, models[i].color);
            // NEW
            // Material.
            gl.uniform3fv(prog.materialKaUniform, models[i].material.ka);
            gl.uniform3fv(prog.materialKdUniform, models[i].material.kd);
            gl.uniform3fv(prog.materialKsUniform, models[i].material.ks);
            gl.uniform1f(prog.materialKeUniform, models[i].material.ke);

            draw(models[i]);
        }
    }

    function calculateCameraOrbit() {
        // Calculate x,z position/eye of camera orbiting the center.
        var x = 0, z = 2;
        camera.eye[x] = camera.center[x];
        camera.eye[z] = camera.center[z];
        camera.eye[x] += camera.distance * Math.sin(camera.zAngle);
        camera.eye[z] += camera.distance * Math.cos(camera.zAngle);
    }

    
    function cameraReset() {
        camera.eye = [0, 1, 4];
        camera.center = [0, .5, 0];
        camera.up = [0, 1, 0];
        camera.fovy = 60.0 * Math.PI / 180;
        camera.lrtb = 2.0;
        camera.vMatrix = mat4.create();
        camera.pMatrix = mat4.create();
        camera.projectionType = "perspective";
        camera.xAngle = 0;
        camera.yAngle = 0;
        camera.zAngle = 0;
        camera.distance = 4;
    }

    function setProjection() {
        // Set projection Matrix.
        switch (camera.projectionType) {
        case ("ortho"):
            var v = camera.lrtb;
            mat4.ortho(camera.pMatrix, -v, v, -v, v, -10, 100);
            break;
        case ("frustum"):
            var v = camera.lrtb;
            mat4.frustum(camera.pMatrix, -v / 2, v / 2, -v / 2, v / 2,
                    1, 10);
            break;
        case ("perspective"):
            mat4.perspective(camera.pMatrix, camera.fovy, camera.aspect, 1,
                    10);
            break;
        }
        // Set projection uniform.
        gl.uniformMatrix4fv(prog.pMatrixUniform, false, camera.pMatrix);
    }

    /**
     * Update model-view matrix for model.
     */
    function updateTransformations(model) {

        // Use shortcut variables.
        var mMatrix = model.mMatrix;
        var mvMatrix = model.mvMatrix;

        // Reset matrices to identity.
        mat4.identity(mMatrix);
        mat4.identity(mvMatrix);

        // Translate.
        mat4.translate(mMatrix, mMatrix, model.translate);
        // Rotate.
        mat4.rotateX(mMatrix, mMatrix, model.rotate[0]);
        mat4.rotateY(mMatrix, mMatrix, model.rotate[1]);
        mat4.rotateZ(mMatrix, mMatrix, model.rotate[2]);
        // Scale
        mat4.scale(mMatrix, mMatrix, model.scale);

        // Combine view and model matrix
        // by matrix multiplication to mvMatrix.
        mat4.multiply(mvMatrix, camera.vMatrix, mMatrix);

        // Calculate normal matrix from model matrix.
        mat3.normalFromMat4(model.nMatrix, mvMatrix);
    }

    function draw(model) {
        // Setup position VBO.
        gl.bindBuffer(gl.ARRAY_BUFFER, model.vboPos);
        gl.vertexAttribPointer(prog.positionAttrib, 3, gl.FLOAT,
                    false, 0, 0);

        // Setup normal VBO.
        gl.bindBuffer(gl.ARRAY_BUFFER, model.vboNormal);
        gl.vertexAttribPointer(prog.normalAttrib, 3, gl.FLOAT, false, 0, 0);

        // Setup rendering triangles.
        var fill = (model.fillstyle.search(/fill/) != -1);
        if (fill) {
            gl.enableVertexAttribArray(prog.normalAttrib);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.iboTriangles);
            gl.drawElements(gl.TRIANGLES, model.iboTriangles.numberOfElements,
                    gl.UNSIGNED_SHORT, 0);
        }

        // Setup rendering lines.
        var wireframe = (model.fillstyle.search(/wireframe/) != -1);
        if (wireframe) {
            gl.uniform4fv(prog.colorUniform, [ 0., 0., 0., 1. ]);
            gl.disableVertexAttribArray(prog.normalAttrib);
            gl.vertexAttrib3f(prog.normalAttrib, 0, 0, 0);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.iboLines);
            gl.drawElements(gl.LINES, model.iboLines.numberOfElements,
                    gl.UNSIGNED_SHORT, 0);
        }
    }

    // App interface.
    return {
        start : start
    };

}());