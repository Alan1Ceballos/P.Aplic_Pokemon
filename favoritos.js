const listaFavoritos = document.getElementById('listaFavoritos');
const buscadorFavoritos = document.getElementById('buscadorFavoritos');
const cerrarModal = document.getElementById('cerrarModal');
const botonVolver = document.getElementById('enlacePrincipal');

//carga los favoritos del localStorage
let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];

//muestra las tarjetas de los Pokémon favoritos
async function mostrarPokemonesFavoritos() {
    listaFavoritos.innerHTML = '';

    for (const pokemon of favoritos) {
        try {
            const respuesta = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.toLowerCase()}`);
            const datosPokemon = await respuesta.json();

            const nombrePokemonCapitalizado = datosPokemon.name.charAt(0).toUpperCase() + datosPokemon.name.slice(1);

            const tarjeta = document.createElement('div');
            tarjeta.className = 'pokemon-card';
            tarjeta.innerHTML = `
                <img src="${datosPokemon.sprites.front_default}" alt="${nombrePokemonCapitalizado}">
                <h3>${nombrePokemonCapitalizado}</h3>
                <button class="boton-favorito ${favoritos.includes(nombrePokemonCapitalizado) ? 'activo' : ''}" 
                        onclick="alternarFavorito(event, '${nombrePokemonCapitalizado}', this)">
                    Favorito
                </button>
            `;

            tarjeta.addEventListener('click', () => obtenerDetallesPokemon(datosPokemon.name));

            listaFavoritos.appendChild(tarjeta);
        } catch (error) {
            console.error('Error al obtener los datos del Pokémon:', error);
        }
    }
}

//filtra Pokémon favoritos
buscadorFavoritos.addEventListener('input', () => {
    const filtro = buscadorFavoritos.value.toLowerCase();
    const tarjetas = document.querySelectorAll('.pokemon-card');
    tarjetas.forEach(tarjeta => {
        const nombre = tarjeta.querySelector('h3').textContent.toLowerCase();
        tarjeta.style.display = nombre.includes(filtro) ? 'block' : 'none';
    });
});

//obtiene los detalles de un Pokémon
async function obtenerDetallesPokemon(nombre) {
    try {
        const respuesta = await fetch(`https://pokeapi.co/api/v2/pokemon/${nombre}`);
        const datos = await respuesta.json();
        mostrarModal(datos);
    } catch (error) {
        console.error('Error al obtener los detalles del Pokémon:', error);
    }
}

//muestra el modal con los detalles del Pokémon
function mostrarModal(pokemon) {
    const nombrePokemonCapitalizado = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
    nombreModal.textContent = nombrePokemonCapitalizado;
    imagenModal.src = pokemon.sprites.front_default;
    alturaModal.textContent = `${pokemon.height * 10} cm`;
    pesoModal.textContent = `${pokemon.weight / 10} kg`;
    habilidadesModal.textContent = pokemon.abilities.map(h => h.ability.name.charAt(0).toUpperCase() + h.ability.name.slice(1)).join(', ');

    const tiposModal = document.getElementById('tiposModal');
    tiposModal.innerHTML = '';
    pokemon.types.forEach(tipo => {
        const nombreTipo = tipo.type.name;
        const iconoTipo = document.createElement('img');
        iconoTipo.src = `imagenes/${nombreTipo}.png`;
        iconoTipo.alt = nombreTipo;
        iconoTipo.style.width = '70px';
        iconoTipo.style.marginRight = '5px';
        tiposModal.appendChild(iconoTipo);
    });

    modalPokemon.style.display = 'block';
}

//cierra el modal
cerrarModal.onclick = () => {
    modalPokemon.style.display = 'none';
};

//alternar el boton de Pokémon favorito
function alternarFavorito(evento, pokemon, boton) {
    evento.stopPropagation();
    const indice = favoritos.indexOf(pokemon);
    if (indice === -1) {
        favoritos.push(pokemon);
        boton.classList.add('activo');
    } else {
        favoritos.splice(indice, 1);
        boton.classList.remove('activo');
    }
    localStorage.setItem('favoritos', JSON.stringify(favoritos));
    mostrarPokemonesFavoritos();
}

//cargamos los pokémon favoritos
mostrarPokemonesFavoritos();
