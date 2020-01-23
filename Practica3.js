//ALVARO BERRIO GALINDO

var   gl = null,
      canvas = null,
      glProgram = null,
      fragmentShader = null,
      vertexShader = null;

// Global variables
var g_perspectiveMatrix = new Matrix4();
var g_modelMatrix = new Matrix4();
var g_viewMatrix = new Matrix4();

var perspectiveMatrixShaderLocation;
var modelMatrixShaderLocation;
var viewMatrixShaderLocation;
var lightPositionShaderLocation;
var f_viewMatrixShaderLocation;

var g_vertexPositionBuffer;
var g_vertexNormalBuffer;

let ratonAbajo = false;
let posRatonX = null;
let posRatonY = null;

let textureLocatAttrib=null;
let textureCoord, texture,texBuffer;
let uTexture;

/*** ELEMENTOS HTML ***/
let slider_ambiente,slider_difusa,radiobutton,box_ambiente,box_disfusa;

//radio button de los tipos de textura
var textura_seleccionada;
var radios = document.forms["rbutton"].elements["text"];

radios.value="naturaleza.jpg";
textura_seleccionada=radios.value;
for(radio in radios) {
    radios[radio].onclick = function() {
        textura_seleccionada=this.value;
    }
}

//slider de las luces ambiente y difusa
slider_ambiente = document.getElementById("luz_ambiente");
slider_difusa = document.getElementById("luz_difusa");
//checkbox de las luces ambiente y difusa
box_ambiente = document.getElementById("box_ambiente");
box_difusa = document.getElementById("box_difusa");
box_ambiente.checked=true;
box_difusa.checked=true;

box_ambiente.oninput = function(){
  if(box_ambiente.checked!=true){
    la=0;
    slider_ambiente.disabled=true;
  }else{
    slider_ambiente.disabled=false;
    la=slider_ambiente.value/100;
  }
}

box_difusa.oninput = function(){
  if(box_difusa.checked!=true){
    ld=0;
    slider_difusa.disabled=true;
  }else{
    slider_difusa.disabled=false;
    ld=slider_difusa.value/100;
  }
}

slider_ambiente.value=50;
slider_difusa.value=85;

let la=slider_ambiente.value/100;
let ld=slider_difusa.value/100;

slider_ambiente.oninput = function() {
  la = this.value/100;
}

slider_difusa.oninput = function() {
  ld = this.value/100;
}

/*********************** RATON Y TECLADO: Funciones de control del Movimiento y Rotación***/
/* Deteccion de eventos*/

function deteccionEventos(){
	canvas.onmousedown=pulsaRatonAbajo;
	canvas.onmouseup=pulsaRatonArriba;
	canvas.onmousemove=mueveRaton;
	canvas.onkeydown=pulsaTecla;
}
/* Gestion de ventos*/

function pulsaRatonAbajo(event) {
  ratonAbajo = true;
  posRatonX = event.clientX;
  posRatonY = event.clientY;
}

function pulsaRatonArriba(event) {
  ratonAbajo = false;
}

function mueveRaton(event) {
  if (!ratonAbajo) {
      return;
  }
  let nuevaX = event.clientX;
  let nuevaY = event.clientY;
  let deltaX = nuevaX - posRatonX;
  let deltaY = nuevaY - posRatonY;

  let idMatrix=mat4.create();
  mat4.identity(idMatrix);

  mat4.rotate(idMatrix,degToRad(deltaX/2), [0,1,0],idMatrix);
  mat4.rotate(idMatrix,degToRad(deltaY/2), [1,0,0],idMatrix);

  mat4.multiply(g_modelMatrix.elements, idMatrix, g_modelMatrix.elements);
  posRatonX = nuevaX;
  posRatonY = nuevaY;
}


function degToRad(degrees) {
  return degrees * Math.PI / 180;
}

function pulsaTecla(event){
var g_near=0, g_far=0;
switch(event.keyCode){
	case 39: console.log("39");g_near += 0.01; break;  // The right arrow key was pressed
	case 37: g_near -= 0.01; break;  // The left arrow key was pressed
	case 38: g_far += 0.01;  break;  // The up arrow key was pressed
	case 40: g_far -= 0.01;  break;  // The down arrow key was pressed
	default: return; // Prevent the unnecessary drawing
}
}

  /* ************** INITWEBGL  ****************/
  function initWebGL(){
     canvas = document.getElementById("canvas");
     gl = canvas.getContext("webgl");

          if(gl)
          {
            setupWebGL();
            initShaders();
            setupBuffers();
            deteccionEventos();
            var animacion = function() {
              window.requestAnimationFrame(animacion);
              drawScene();
            };
            animacion();
          }
          else{
            alert(  "El navegador no soporta WEBGL.");
          }
     }
  /* ************** SETUPWEBGL  ****************/
        function setupWebGL()
        {
          //Pone el color de fondo a verde ---para 2d no funciona
          gl.clearColor(0.8, 0.8, 0.8, 1.0);
          gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

          //Crea un viewport del tamaño del canvas
          gl.viewport(0, 0, canvas.width, canvas.height);


          gl.enable(gl.DEPTH_TEST);

          gl.frontFace(gl.CCW);
          gl.enable(gl.CULL_FACE);
          gl.cullFace(gl.BACK);

        }
              /********************* 3. INIT SHADER **************************************/
        function initShaders()
        {
         // Esta función inicializa los shaders

          //1.Obtengo la referencia de los shaders
          var fs_source = document.getElementById('fragment-shader').innerHTML;
          var vs_source = document.getElementById('vertex-shader').innerHTML;

          //2. Compila los shaders
          vertexShader = makeShader(vs_source, gl.VERTEX_SHADER);
          fragmentShader = makeShader(fs_source, gl.FRAGMENT_SHADER);

            //3. Crea un programa
            glProgram = gl.createProgram();

          //4. Adjunta al programa cada shader
            gl.attachShader(glProgram, vertexShader);
            gl.attachShader(glProgram, fragmentShader);
            gl.linkProgram(glProgram);

          if (!gl.getProgramParameter(glProgram, gl.LINK_STATUS)) {
             alert("No se puede inicializar el Programa .");
            }

          //5. Usa el programa
          gl.useProgram(glProgram);
        }
       /********************* 3.1. MAKE SHADER **************************************/
        function makeShader(src, type)
        {
          //Compila cada  shader
          var shader = gl.createShader(type);
          gl.shaderSource(shader, src);
          gl.compileShader(shader);

          if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                alert("Error de compilación del shader: " + gl.getShaderInfoLog(shader));
            }
          return shader;
        }

        /****************** Set Texture ********************/

        function setTexture(texture){
        	gl.bindTexture(gl.TEXTURE_2D,texture);
  	     	gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA, gl.UNSIGNED_BYTE, texture.image );
      		// parámetros de filtrado
    			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      		// parámetros de repetición (ccordenadas de textura mayores a uno)
    			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
    			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
      		// creación del mipmap
    			gl.generateMipmap(gl.TEXTURE_2D);

        }
  /************  ***********************/
   function setupBuffers(){


     var cubeVertices = new Float32Array([
        //Back face
        -0.5, -0.5,  -0.5,
        -0.5,  0.5,  -0.5,
         0.5, -0.5,  -0.5,
        -0.5,  0.5,  -0.5,
         0.5,  0.5,  -0.5,
         0.5, -0.5,  -0.5,

        //Front face
        -0.5, -0.5,   0.5,
         0.5, -0.5,   0.5,
        -0.5,  0.5,   0.5,
        -0.5,  0.5,   0.5,
         0.5, -0.5,   0.5,
         0.5,  0.5,   0.5,

        //Top face
        -0.5,   0.5, -0.5,
        -0.5,   0.5,  0.5,
         0.5,   0.5, -0.5,
        -0.5,   0.5,  0.5,
         0.5,   0.5,  0.5,
         0.5,   0.5, -0.5,

        //Bottom face
        -0.5,  -0.5, -0.5,
         0.5,  -0.5, -0.5,
        -0.5,  -0.5,  0.5,
        -0.5,  -0.5,  0.5,
         0.5,  -0.5, -0.5,
         0.5,  -0.5,  0.5,

        //Left face
        -0.5,  -0.5, -0.5,
        -0.5,  -0.5,  0.5,
        -0.5,   0.5, -0.5,
        -0.5,  -0.5,  0.5,
        -0.5,   0.5,  0.5,
        -0.5,   0.5, -0.5,

        //Right face
         0.5,  -0.5, -0.5,
         0.5,   0.5, -0.5,
         0.5,  -0.5,  0.5,
         0.5,  -0.5,  0.5,
         0.5,   0.5, -0.5,
         0.5,   0.5,  0.5,

     ]);

     var cubeNormals = new Float32Array([
       0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,
       0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   // back

       0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,
       0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // front

       0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,
       0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0, // top

       0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,
       0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0, // down

      -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,
      -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0, // left

       1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,
       1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0, // right
   	]);

     g_vertexPositionBuffer = gl.createBuffer();
     g_vertexNormalBuffer = gl.createBuffer();

     gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexPositionBuffer);
     gl.bufferData(gl.ARRAY_BUFFER, cubeVertices, gl.STATIC_DRAW);

     gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexNormalBuffer);
     gl.bufferData(gl.ARRAY_BUFFER, cubeNormals, gl.STATIC_DRAW);

     var lightPosition = new Float32Array([4.0, 2.0, 3.0]);
     gl.uniform3fv(lightPositionShaderLocation, lightPosition);

     gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexPositionBuffer);
     var a_Position = gl.getAttribLocation(glProgram, 'a_Position');
     gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
     gl.enableVertexAttribArray(a_Position);

     gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexNormalBuffer);
     var a_Normal = gl.getAttribLocation(glProgram, 'a_Normal');
     gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
     gl.enableVertexAttribArray(a_Normal);


     /* TEXTURAS */

     /****  PONER COORD TEXTURAS ***/

     textureCoord = [
       // select the top left image
         0   , 0  ,
         0   , 0.5,
         0.25, 0  ,
         0   , 0.5,
         0.25, 0.5,
         0.25, 0  ,

         // select the top middle image
         0.25, 0  ,
         0.5 , 0  ,
         0.25, 0.5,
         0.25, 0.5,
         0.5 , 0  ,
         0.5 , 0.5,
         // select to top right image
         0.5 , 0  ,
         0.5 , 0.5,
         0.75, 0  ,
         0.5 , 0.5,
         0.75, 0.5,
         0.75, 0  ,
         // select the bottom left image
         0   , 0.5,
         0.25, 0.5,
         0   , 1  ,
         0   , 1  ,
         0.25, 0.5,
         0.25, 1  ,
         // select the bottom middle image
         0.25, 0.5,
         0.25, 1  ,
         0.5 , 0.5,
         0.25, 1  ,
         0.5 , 1  ,
         0.5 , 0.5,
         // select the bottom right image
         0.5 , 0.5,
         0.75, 0.5,
         0.5 , 1  ,
         0.5 , 1  ,
         0.75, 0.5,
         0.75, 1  ,

     ]
   }

  /*  *********    DRAWSCENE    ***************** */
  function drawScene(){

    /**** CREAR TEXTURA  *****/
  texture = gl.createTexture();
  texture.image=new Image();
  texture.image.onload = function(){
    setTexture(texture);
  }//de la funcion onload

   texture.image.src=textura_seleccionada;

    /******* ACTIVACION DE TEXTURA ****/
    gl.activeTexture(gl.TEXTURE0);

    /**** CREAR BUFFER DE TEXTURA ***/
    texBuffer=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,texBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoord), gl.STATIC_DRAW);

    /**** LOCALIZAR ATRIBUTO TEXTURA ***/
    textureLocatAttrib = gl.getAttribLocation(glProgram, "aTexCoord");
    gl.enableVertexAttribArray(textureLocatAttrib);
    gl.bindBuffer(gl.ARRAY_BUFFER,texBuffer);
    gl.vertexAttribPointer(textureLocatAttrib,2,gl.FLOAT,false,0,0);
    uTexture=gl.getUniformLocation(glProgram,'uTexture');
    gl.uniform1i(uTexture,0);

    perspectiveMatrixShaderLocation = gl.getUniformLocation(glProgram, 'u_perspectiveMatrix');
    modelMatrixShaderLocation = gl.getUniformLocation(glProgram, 'u_modelMatrix');
    viewMatrixShaderLocation = gl.getUniformLocation(glProgram, 'u_viewMatrix');
    lightPositionShaderLocation = gl.getUniformLocation(glProgram, 'u_lightPosition');

    g_perspectiveMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100);
    g_viewMatrix.setLookAt(5, 2, 2,   0, 0, 0,    0, 1, 0);

    gl.uniformMatrix4fv(modelMatrixShaderLocation, false, g_modelMatrix.elements);
    gl.uniformMatrix4fv(perspectiveMatrixShaderLocation, false, g_perspectiveMatrix.elements);
    gl.uniformMatrix4fv(viewMatrixShaderLocation, false, g_viewMatrix.elements);

    amb=gl.getUniformLocation(glProgram, "ambiente");
    dif=gl.getUniformLocation(glProgram, "difusa");
    gl.uniform1f(amb, la);
    gl.uniform1f(dif, ld);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES,0,36);
  }
