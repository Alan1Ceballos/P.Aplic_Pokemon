//obtiene los elementos del DOM
const listaPokemon = document.getElementById('listaPokemon');
const buscadorPokemon = document.getElementById('buscadorPokemon');
const modalPokemon = document.getElementById('modalPokemon');
const nombreModal = document.getElementById('nombreModal');
const imagenModal = document.getElementById('imagenModal');
const alturaModal = document.getElementById('alturaModal');
const pesoModal = document.getElementById('pesoModal');
const habilidadesModal = document.getElementById('habilidadesModal');
const cerrarModal = document.querySelector('.icono-cerrar');
const generaciones = [
    { gen: 1, limite: 151, inicio: 0 },// 1ra generación: #001 - #151
    { gen: 2, limite: 100, inicio: 151 },// 2da generación: #152 - #251
    { gen: 3, limite: 135, inicio: 251 },// 3ra generación: #252 - #386
    { gen: 4, limite: 107, inicio: 386 },// 4ta generación: #387 - #493
    { gen: 5, limite: 156, inicio: 493 },// 5ta generación: #494 - #649
    { gen: 6, limite: 72, inicio: 649 },// 6ta generación: #650 - #721
    { gen: 7, limite: 88, inicio: 721 },// 7ma generación: #722 - #809
    { gen: 8, limite: 89, inicio: 809 },// 8va generación: #810 - #898
    { gen: 9, limite: 112, inicio: 898 }//9na generación: #899 - #1010
];

let paginaActual = 0; //empezamoa en la primera generación


//inicializo favoritos desde localStorage
let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];

//funcion para obtener Pokémon
async function obtenerPokemones(generacion) {
    const { limite, inicio } = generaciones[generacion];
    const respuesta = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limite}&offset=${inicio}`);
    const datos = await respuesta.json();
    mostrarPokemones(datos.results);
}

//altenar el boton de Pokémons favoritos
function alternarFavorito(pokemon, boton) {
    const indice = favoritos.indexOf(pokemon);
    if (indice === -1) {
        favoritos.push(pokemon); //agregamos a favoritos
        boton.classList.add('activo'); //alternamos el botón
    } else {
        favoritos.splice(indice, 1); //eliminamos de favoritos
        boton.classList.remove('activo'); //alternamos el botón
    }
    localStorage.setItem('favoritos', JSON.stringify(favoritos)); //lo guardamos en el localStorage
}

//muestra las tarjetas de los Pokémons
async function mostrarPokemones(pokemones) {
    listaPokemon.innerHTML = ''; //limpiamos la lista
    for (const pokemon of pokemones) {
        const respuesta = await fetch(pokemon.url);
        const datosPokemon = await respuesta.json();

        const nombrePokemonCapitalizado = datosPokemon.name.charAt(0).toUpperCase() + datosPokemon.name.slice(1);

        const tarjeta = document.createElement('div');
        tarjeta.className = 'pokemon-card';
        tarjeta.innerHTML = ` 
            <img src="${datosPokemon.sprites.front_default}" alt="${nombrePokemonCapitalizado}">
            <h3>${nombrePokemonCapitalizado}</h3>
            <button class="boton-favorito" onclick="alternarFavorito('${nombrePokemonCapitalizado}', this)">
                Favorito
            </button>
        `;

        if (favoritos.includes(nombrePokemonCapitalizado)) {
            tarjeta.querySelector('.boton-favorito').classList.add('activo'); //marcamos si es favorito
        }

        const botonFavorito = tarjeta.querySelector('.boton-favorito');
        botonFavorito.addEventListener('click', (evento) => {
            evento.stopPropagation(); //evitamos que el clic al boton active el evento de la tarjeta
        });

        tarjeta.addEventListener('click', () => obtenerDetallesPokemon(datosPokemon.name)); //mostramos detalles al hacer clic en un modal
        listaPokemon.appendChild(tarjeta); //añade la tarjeta a la lista
    }
}

//obtiene detalles de un Pokémon
async function obtenerDetallesPokemon(nombre) {
    const respuesta = await fetch(`https://pokeapi.co/api/v2/pokemon/${nombre}`);
    const datos = await respuesta.json();
    mostrarModal(datos); //muestra los detalles en el modal
}

//muestra el modal con los detalles del pokemon
function mostrarModal(pokemon) {
    const nombrePokemonCapitalizado = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
    nombreModal.textContent = nombrePokemonCapitalizado;
    imagenModal.src = pokemon.sprites.front_default;
    alturaModal.textContent = `${pokemon.height * 10} cm`;
    pesoModal.textContent = `${pokemon.weight / 10} kg`;
    habilidadesModal.textContent = pokemon.abilities.map(h => h.ability.name.charAt(0).toUpperCase() + h.ability.name.slice(1)).join(', ');

    const tiposModal = document.getElementById('tiposModal');
    tiposModal.innerHTML = ''; //limpiamos los tipos
    pokemon.types.forEach(tipo => {
        const nombreTipo = tipo.type.name;
        const iconoTipo = document.createElement('img'); //crea el icono del tipo
        iconoTipo.src = `imagenes/${nombreTipo}.png`; //url a la img del icono
        iconoTipo.alt = nombreTipo;
        iconoTipo.style.width = '70px';
        iconoTipo.style.marginRight = '5px';
        tiposModal.appendChild(iconoTipo); //añade el icono al modal
    });

    modalPokemon.style.display = 'block'; // muestra el modal
}

//cierra el modal
cerrarModal.onclick = () => {
    modalPokemon.style.display = 'none'; //oculta el modal
};

//muestra los botones de paginación
function mostrarBotonesPaginacion() {
    const paginacion = document.createElement('div');
    paginacion.className = 'paginacion';

    const btnAnterior = document.createElement('button');
    btnAnterior.textContent = 'Anterior';
    btnAnterior.disabled = paginaActual === 0;
    btnAnterior.onclick = () => cambiarPagina(paginaActual - 1);
    paginacion.appendChild(btnAnterior);

    const btnSiguiente = document.createElement('button');
    btnSiguiente.textContent = 'Siguiente';
    btnSiguiente.disabled = paginaActual === generaciones.length - 1;
    btnSiguiente.onclick = () => cambiarPagina(paginaActual + 1);
    paginacion.appendChild(btnSiguiente);

    document.body.appendChild(paginacion);
}

//cambia de página (generación)
function cambiarPagina(nuevaPagina) {
    paginaActual = nuevaPagina;
    obtenerPokemones(paginaActual);
    document.querySelector('.paginacion').remove(); //elimina los botones previos
    mostrarBotonesPaginacion(); //añade los nuevos botones
}

//carga los Pokémons en la pagina
obtenerPokemones(paginaActual);
mostrarBotonesPaginacion();