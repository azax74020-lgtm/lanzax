const pokemonInput = document.getElementById('pokemon-input');
const searchBtn = document.getElementById('search-btn');
const resetBtn = document.getElementById('reset-btn');
const statusMessage = document.getElementById('status-message');
const pokemonGrid = document.getElementById('pokemon-grid');

const pokemonModal = document.getElementById('pokemon-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const modalBody = document.getElementById('modal-body');

// Cargar múltiples Pokémon al iniciar
async function loadMultiplePokemons(limit = 24) {
  statusMessage.textContent = 'Cargando Pokédex...';
  pokemonGrid.innerHTML = '';

  try {
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=' + limit);
    const data = await response.json();

    for (let pokemon of data.results) {
      await fetchPokemonDetails(pokemon.url);
    }
    statusMessage.textContent = '';
  } catch (error) {
    statusMessage.textContent = '❌ Error al cargar la lista de Pokémon.';
  }
}

// Obtener detalles e insertar en la cuadrícula
async function fetchPokemonDetails(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    renderPokemonCard(data);
  } catch (error) {
    console.error('Error cargando detalle', error);
  }
}

// Renderizar una tarjeta individual
function renderPokemonCard(data) {
  const card = document.createElement('div');
  card.classList.add('pokemon-card');

  const idFormatted = '#' + data.id.toString().padStart(3, '0');
  const name = data.name;
  const image = data.sprites.other['official-artwork'].front_default || data.sprites.front_default;
  
  let typesHTML = '';
  data.types.forEach(t => {
    typesHTML += '<span class="type-badge type-' + t.type.name + '">' + t.type.name + '</span>';
  });

  const abilities = data.abilities.map(a => a.ability.name).join(', ');
  const hp = data.stats.find(s => s.stat.name === 'hp').base_stat;
  const attack = data.stats.find(s => s.stat.name === 'attack').base_stat;

  card.innerHTML = 
    '<div class="card-header">' +
      '<span class="pokemon-id">' + idFormatted + '</span>' +
      '<h3 class="pokemon-name">' + name + '</h3>' +
    '</div>' +
    '<div class="image-container">' +
      '<img src="' + image + '" alt="' + name + '">' +
    '</div>' +
    '<div class="types-container">' + typesHTML + '</div>' +
    '<div class="info-snippet"><strong>Habilidades:</strong> ' + abilities + '</div>' +
    '<div class="stats-preview">' +
      '<div class="stat-row-mini"><span>PS:</span> <strong>' + hp + '</strong></div>' +
      '<div class="stat-row-mini"><span>Ataque:</span> <strong>' + attack + '</strong></div>' +
    '</div>' +
    '<span class="click-hint">🔍 Clic para detalles</span>';

  // Evento al hacer clic en la tarjeta para abrir el modal con la descripción
  card.addEventListener('click', () => {
    openPokemonModal(data);
  });

  pokemonGrid.appendChild(card);
}

// Abrir la ventana modal y buscar la descripción breve en español
async function openPokemonModal(data) {
  modalBody.innerHTML = '<p style="text-align:center;">Cargando descripción...</p>';
  pokemonModal.classList.remove('hidden');

  let descriptionText = 'No hay descripción disponible en español para este Pokémon.';

  try {
    const speciesResponse = await fetch('https://pokeapi.co/api/v2/pokemon-species/' + data.id);
    const speciesData = await speciesResponse.json();

    // Buscar una entrada de texto de la Pokedex en español (es)
    const spanishEntry = speciesData.flavor_text_entries.find(entry => entry.language.name === 'es');
    if (spanishEntry) {
      descriptionText = spanishEntry.flavor_text.replace(/[\r\n\x0f]/g, ' ');
    }
  } catch (error) {
    console.error('Error al obtener la descripción', error);
  }

  // Formatear datos
  const image = data.sprites.other['official-artwork'].front_default || data.sprites.front_default;
  const idFormatted = '#' + data.id.toString().padStart(3, '0');
  
  let typesHTML = '';
  data.types.forEach(t => {
    typesHTML += '<span class="type-badge type-' + t.type.name + '">' + t.type.name + '</span>';
  });

  const abilities = data.abilities.map(a => a.ability.name).join(', ');

  // Renderizar la ventana emergente
  modalBody.innerHTML = 
    '<div class="card-header">' +
      '<span class="pokemon-id">' + idFormatted + '</span>' +
      '<h2 class="pokemon-name">' + data.name + '</h2>' +
    '</div>' +
    '<div class="image-container" style="text-align:center;">' +
      '<img src="' + image + '" alt="' + data.name + '" style="width:160px; height:160px;">' +
    '</div>' +
    '<div class="types-container" style="justify-content:center;">' + typesHTML + '</div>' +
    '<p class="modal-description">"' + descriptionText + '"</p>' +
    '<div class="modal-info-grid">' +
      '<div><strong>Altura:</strong> ' + (data.height / 10).toFixed(1) + ' m</div>' +
      '<div><strong>Peso:</strong> ' + (data.weight / 10).toFixed(1) + ' kg</div>' +
    '</div>' +
    '<div style="font-size:0.85rem; color:#555; margin-bottom:10px;"><strong>Habilidades:</strong> ' + abilities + '</div>';

  pokemonModal.classList.remove('hidden');
}

// Buscar Pokémon por entrada de texto
async function searchPokemon(query) {
  const searchTerm = query.trim().toLowerCase();

  if (!searchTerm) {
    loadMultiplePokemons();
    return;
  }

  statusMessage.textContent = 'Buscando...';
  pokemonGrid.innerHTML = '';

  try {
    const response = await fetch('https://pokeapi.co/api/v2/pokemon/' + searchTerm);

    if (!response.ok) {
      throw new Error('No encontrado');
    }

    const data = await response.json();
    statusMessage.textContent = '';
    renderPokemonCard(data);
  } catch (error) {
    statusMessage.textContent = '❌ No se encontró ningún Pokémon con ese nombre o número.';
  }
}

// Event Listeners
searchBtn.addEventListener('click', () => {
  searchPokemon(pokemonInput.value);
});

pokemonInput.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    searchPokemon(pokemonInput.value);
  }
});

resetBtn.addEventListener('click', () => {
  pokemonInput.value = '';
  loadMultiplePokemons();
});

// Cerrar la ventana emergente
closeModalBtn.addEventListener('click', () => {
  pokemonModal.classList.add('hidden');
});

// Cerrar al hacer clic fuera del recuadro
pokemonModal.addEventListener('click', (event) => {
  if (event.target === pokemonModal) {
    pokemonModal.classList.add('hidden');
  }
});

// Cargar la lista inicial
loadMultiplePokemons();