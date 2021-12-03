// document es un objeto global que nos permite accesar todo lo que esta dentro de 
//nuestro HTML, getElementById, nos ayuda a encontrar un elemnto especifico dentro del
//mismo, usando su identificador único.

/** CONSTANTES **/
let DIRECCIONES = {
    ARRIBA: 1,
    ABAJO: 2,
    IZQUIERDA: 3,
    DERECHA: 4,
};

let FPS = 1000 / 15; // velocidad a la que se mueve la culebra, ciclos por segundo

let JUEGO_CANVAS = document.getElementById("juegoCanvas"); //mediante document busco dentro
// del HTML el elemento "juegoCanvas" y luego mediante let lo alamceno en el objeto
// // juegoCanvas, para posteriormente llamarlo y usarlo.
let CTX = JUEGO_CANVAS.getContext("2d"); // Propieda aplicada a juegoCanvas que permitira
//                                         // dibujar figuras planas dentro de él.
//                                        // luego, asignamos su valor a ctx, como una
//                                        // abreviatura de código.

let CONTENEDOR_NINTENDO = document.getElementById("contenedorNintendo");

let PUNTOS_TEXTO = document.getElementById("puntos");
let BANNER_ROTAR_TELEFONO = document.getElementById("bannerRotarTelefono");
let TITULO = document.getElementById("titulo");
let BOTON_CERRAR_BANNER = document.getElementById("botonCerrarBanner");
let SONIDO_GANASTE_PUNTO = new Audio("ganaste_un_punto.wav");
let SONIDO_CHOQUE = new Audio("choque.wav");
let CSS_CLASE_SACUDIR_HORIZONTALMENTE = "shake-horizontal";
let CSS_CLASE_ESCONDER = "esconder";

// ctx.beginPath(); // le decimos al navegador que queremos dibujar algo dentro del canvas
// ctx.fillStyle = "red"; // indicamos que queremos dibujar algo rojo, propiedad del ctx
// ctx.fillRect(0, 0, 100, 100); //el objeto rojo será un rectangulo con origen
//                               //en x=0, y=0 y sera de 100x100 pixels.
// ctx.stroke(); //le dice al navegador que dibuje lo antes descrito dentro del canvas

// ctx.beginPath();
// ctx.fillStyle = "blue";
// ctx.ellipse(300, 300, 150, 50, 0, 0, 2 * Math.PI);
// ctx.fill();
// ctx.stroke();

// ctx.font = "50px Arial";
// ctx.fillStyle = "black";
// ctx.fillText("Culebrita !", 200, 318);

/** ESTADO DEL JUEGO **/

let culebra;
let direccionActual;
let nuevaDireccion;
let comida; // invoca la funcion de generar comida en posicion aleatoria
let ciclo; // variable que impedira que se aumente la velocidad del FPS
let puntos;

/** DIBUJAR **/

function rellenarCuadrado(context, posX, posY) {
    context.beginPath();
    context.fillStyle = "#2e490b";
    context.fillRect(posX, posY, 20, 20);
    context.stroke(); 
}

function dibujarCulebra(context, culebra) {
    for (let i = 0; i < culebra.length; i++) { //i es la variable que permite recorrer el arreglo de posiciones
        rellenarCuadrado(context, culebra[i].posX, culebra[i].posY);
    } 
}

function dibujarComida(context, comida) {
    rellenarCuadrado(context, comida.posX, comida.posY);
}

// Función para dibujar las paredes del juego
function dibujarParedes(context) {
    context.beginPath(); // voy a dibujar algo
    context.lineWidth = "2"; // ancho de la linea de pared
    context.rect(20, 20, 560, 560);
    context.stroke();
}

function dibujarTexto(context, texto, x, y) {
    context.font = "38px Arial";
    context.textAlign = "center";
    context.fillStyle = "black";
    context.fillText(texto, x, y);
}

/** CULEBRA **/

function moverCulebra(direccion,culebra) {
    let cabezaPosX = culebra[0].posX;
    let cabezaPosY = culebra[0].posY;

    if (direccion === DIRECCIONES.DERECHA) {
        cabezaPosX += 20;
    } else if (direccion === DIRECCIONES.IZQUIERDA) {
        cabezaPosX -= 20;
    } else if (direccion === DIRECCIONES.ABAJO) {
        cabezaPosY += 20;
    } else if (direccion === DIRECCIONES.ARRIBA) {
        cabezaPosY -= 20;
    }

    // agregamos la nueva cabeza al principio del arreglo culebra
    culebra.unshift ({posX: cabezaPosX, posY: cabezaPosY});
    // retornamos la cola de la culebra, el último elemento de la lista arreglo
    return culebra.pop(); // {posX, posY} para luego añadirlo al final y hacer que la culebra cresca
}

function culebraComioComida(culebra, comida) {
     /**para detectar si la culebra comió, comparamos la posición de la
       cabeza con la de la comida, si comió, dibujamos comida de nuevo **/
       return culebra[0].posX === comida.posX && culebra[0].posY === comida.posY
};

/** COMIDA **/

function generarNuevaPosicionDeComida(culebra) {
    while(true) {
        /** La función Math.max retorna el mayor de dos números,
         * le mandamos a comparar con 1 para que si da 0 nos retorne
         * 1, de ese modo la comida queda siempre dentro de las paredes */
        let columnaX = Math.max(Math.floor(Math.random() * 29), 1);
        let columnaY = Math.max(Math.floor(Math.random() * 29), 1);

        let posX = columnaX * 20;
        let posY = columnaY * 20;

        let colisionConCulebra = false;
        for (let i = 0; i < culebra.length; i++) {
            if(culebra[i].posX === posX && culebra[i].posY === posY) {
                colisionConCulebra = true;
                break;
            }
        }

        if (colisionConCulebra === true) {
            continue;
        }

        return { posX: posX, posY: posY };
    }
    
}

/** COLISIONES **/

function ocurrioColision(culebra) {
    let cabeza = culebra[0];

    if (cabeza.posX < 20 || cabeza.posY < 20 || cabeza.posX >= 580 || cabeza.posY >= 580) {
        console.log("Ocurrio colision con pared");
        return true;
    }

    if (culebra.length === 1) {
        return false;
    }

    for (let i = 1; i < culebra.length; i++) {
        if (cabeza.posX === culebra[i].posX && cabeza.posY === culebra[i].posY) {
            console.log("Ocurrio colision con culebra");
            return true;
        }
    }

    return false;
}

/** PUNTAJE **/

function mostrarPuntos(puntos) {
    PUNTOS_TEXTO.innerText = "PUNTOS: " + puntos;
}

function incrementarPuntaje() {
    puntos++;
    mostrarPuntos(puntos);
    SONIDO_GANASTE_PUNTO.play();
}

/** RESPONSIVE **/

window.addEventListener("orientationchange", function() {
    TITULO.classList.add(CSS_CLASE_ESCONDER);
    BANNER_ROTAR_TELEFONO.classList.remove(CSS_CLASE_ESCONDER);
});

BOTON_CERRAR_BANNER.addEventListener("click", function () {
    TITULO.classList.remove(CSS_CLASE_ESCONDER);
    BANNER_ROTAR_TELEFONO.classList.add(CSS_CLASE_ESCONDER);
})

/** CICLO DEL JUEGO **/

document.addEventListener("keydown", function(e) {
    if (e.code === "ArrowUp" && direccionActual !== DIRECCIONES.ABAJO) {
        nuevaDireccion = DIRECCIONES.ARRIBA;
    } else if (e.code === "ArrowDown" && direccionActual !== DIRECCIONES.ARRIBA) { 
        nuevaDireccion = DIRECCIONES.ABAJO;
    } else if (e.code === "ArrowLeft" && direccionActual !== DIRECCIONES.DERECHA) {  
        nuevaDireccion = DIRECCIONES.IZQUIERDA;
    } else if (e.code === "ArrowRight" && direccionActual !== DIRECCIONES.IZQUIERDA) { 
        nuevaDireccion = DIRECCIONES.DERECHA; 
    } 
      
});//la e que se le pasa a la funcion es el evento que registramos

function cicloDeJuego() {
    let colaDescartada = moverCulebra(nuevaDireccion, culebra);
    direccionActual = nuevaDireccion;

    /** Invocamos la función que determina si la culebra comió **/
    if (culebraComioComida(culebra, comida)) {
        culebra.push(colaDescartada); /** agrega la cola que habíamos descartado
        al final, haciendo que la culebra cresca */
        comida = generarNuevaPosicionDeComida(culebra);
        incrementarPuntaje();
    }

    if (ocurrioColision(culebra)) {
        SONIDO_CHOQUE.play();
        gameOver();
        return;
    }

    CTX.clearRect(0, 0, 600, 600); // borramos todo el contenido despues de cada movimiento
    dibujarParedes(CTX); // volvemos a dibujar la cuadricula
    dibujarCulebra(CTX, culebra); // dibujamos la culebra nuevamente
    dibujarComida(CTX,comida); // dibujamos comida
}

function gameOver() {
    clearInterval(ciclo);
    ciclo = undefined;
    dibujarTexto(CTX, "¡Fin del Juego!", 300, 290);
    dibujarTexto(CTX, "Has click para volver a jugar", 300, 340);
    // esto activa la clase que da animación de sacudir el nintendo
    CONTENEDOR_NINTENDO.classList.add(CSS_CLASE_SACUDIR_HORIZONTALMENTE);
}

function empezarJuego() {
    culebra = [ // el objeto culebra es ahora un arreglo que contendrá varios cuadros
        {posX: 60, posY: 20},
        {posX: 40, posY: 20},
        {posX: 20, posY: 20},
    ];
    direccionActual = DIRECCIONES.DERECHA;
    nuevaDireccion = DIRECCIONES.DERECHA;
    comida = generarNuevaPosicionDeComida(culebra); // invoca la funcion de generar comida en posicion aleatoria
    puntos = 0;
    mostrarPuntos(puntos);
    CONTENEDOR_NINTENDO.classList.remove(CSS_CLASE_SACUDIR_HORIZONTALMENTE);
    ciclo = setInterval(cicloDeJuego, FPS);
}

dibujarParedes(CTX);
dibujarTexto(CTX, "¡Has click para empezar!", 300, 290);
dibujarTexto(CTX, "Escritorio: Muévete con ↑ ↓ → ←", 300, 340);
dibujarTexto(CTX, "Móvil: tap en pantalla para girar", 300, 390);

JUEGO_CANVAS.addEventListener("click", function() {
    if (ciclo === undefined) { // en el primer click el ciclo es indefinido, ya luego no lo activará
    empezarJuego();
    return; /** esto es para que la culebra no gire al empezar el juego si el 
    usuario no hace click **/ 
  }
  /** Estas lineas de codigo son para usar el juego en dispositivos tactiles,
   haciendo click o tap en pantalla, la culebra gira en sentido horario **/
  if (direccionActual === DIRECCIONES.ABAJO) {
    nuevaDireccion = DIRECCIONES.IZQUIERDA;
} else if (direccionActual === DIRECCIONES.IZQUIERDA) { 
    nuevaDireccion = DIRECCIONES.ARRIBA;
} else if (direccionActual === DIRECCIONES.ARRIBA) {  
    nuevaDireccion = DIRECCIONES.DERECHA;
} else if (direccionActual === DIRECCIONES.DERECHA) { 
    nuevaDireccion = DIRECCIONES.ABAJO; 
}
});


