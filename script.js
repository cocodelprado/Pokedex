const API_URL = 'https://pokeapi.co/api/v2/pokemon/';
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const resultContainer = document.getElementById('result-container');
const historyList = document.getElementById('history-list');
const randomContainer = document.getElementById('random-container');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modal-body');

// Couleurs par type
const typeColors = {
    normal: '#A8A77A', fire: '#EE8130', water: '#6390F0',
    electric: '#F7D02C', grass: '#7AC74C', ice: '#96D9D6',
    fighting: '#C22E28', poison: '#A33EA1', ground: '#E2BF65',
    flying: '#A98FF3', psychic: '#F95587', bug: '#A6B91A',
    rock: '#B6A136', ghost: '#735797', dragon: '#6F35FC',
    dark: '#705746', steel: '#B7B7CE', fairy: '#D685AD'
};

// 1. Initialisation
document.addEventListener('DOMContentLoaded', () => {
    loadHistory();
    fetchRandomPokemon(6); // Charger 6 cartes aléatoires
});

// 2. Gestionnaire de recherche
searchBtn.addEventListener('click', handleSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});

async function handleSearch() {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) return;

    try {
        resultContainer.innerHTML = '<div class="loader">Recherche en cours...</div>';
        const data = await fetchPokemonData(query);
        displayMainPokemon(data);
        addToHistory(data.name);
        searchInput.value = '';
    } catch (error) {
        resultContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-circle" style="color: #ff5252"></i>
                <p>Oups ! Pokémon introuvable.</p>
            </div>`;
    }
}

// 3. Appel API (Générique)
async function fetchPokemonData(query) {
    const response = await fetch(`${API_URL}${query}`);
    if (!response.ok) throw new Error('Not found');
    return await response.json();
}

// 4. Affichage Principal (Carte HD)
function displayMainPokemon(data) {
    const typeMain = data.types[0].type.name;
    const color = typeColors[typeMain];
    const imgUrl = data.sprites.other['official-artwork'].front_default || data.sprites.front_default;

    const typesHtml = data.types.map(t => 
        `<span class="type-badge" style="background:${typeColors[t.type.name]}">${t.type.name}</span>`
    ).join('');

    // On stocke l'objet data en string pour le passer à la modale
    const dataString = encodeURIComponent(JSON.stringify(data));

    resultContainer.innerHTML = `
        <div class="pokemon-card-large" style="--type-bg: ${color}">
            <span class="poke-id">#${data.id.toString().padStart(3, '0')}</span>
            <img src="${imgUrl}" alt="${data.name}" class="poke-img-large">
            <div class="poke-info">
                <h2 class="poke-name">${data.name}</h2>
                <div class="types-container">${typesHtml}</div>
                <button class="details-btn" onclick="openModal('${data.name}')">
                    <i class="fas fa-info-circle"></i> Voir Détails
                </button>
            </div>
        </div>
    `;
}

// 5. Historique
function addToHistory(name) {
    let history = JSON.parse(localStorage.getItem('pokedexHistory')) || [];
    if (!history.includes(name)) {
        history.unshift(name);
        if (history.length > 5) history.pop();
        localStorage.setItem('pokedexHistory', JSON.stringify(history));
        loadHistory();
    }
}

function loadHistory() {
    const history = JSON.parse(localStorage.getItem('pokedexHistory')) || [];
    historyList.innerHTML = history.map(name => 
        `<div class="history-tag" onclick="fetchAndDisplay('${name}')">${name}</div>`
    ).join('');
}

// Fonction helper pour cliquer sur historique/random
window.fetchAndDisplay = async (name) => {
    searchInput.value = name;
    handleSearch();
};

// 6. Aléatoire
async function fetchRandomPokemon(count) {
    randomContainer.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const randomId = Math.floor(Math.random() * 1025) + 1;
        try {
            const data = await fetchPokemonData(randomId);
            createMiniCard(data);
        } catch (e) { console.log(e); }
    }
}

function createMiniCard(data) {
    const card = document.createElement('div');
    card.className = 'mini-card';
    card.innerHTML = `
        <img src="${data.sprites.front_default}" alt="${data.name}">
        <h3>${data.name}</h3>
    `;
    card.addEventListener('click', () => fetchAndDisplay(data.name));
    randomContainer.appendChild(card);
}

// 7. Modale et Stats
window.openModal = async (name) => {
    // On refetch pour être sûr d'avoir les données ou on utilise les données déjà là
    // Ici on refetch rapidement pour la propreté du code
    const data = await fetchPokemonData(name);
    
    const typeColor = typeColors[data.types[0].type.name];
    const statsHtml = data.stats.map(s => {
        const val = s.base_stat;
        const percent = Math.min((val / 200) * 100, 100); // Max stat estimée à 200
        return `
            <div class="stat-row">
                <div class="stat-name">${s.stat.name.replace('special-', 'sp-')}</div>
                <div class="stat-bar-bg">
                    <div class="stat-bar-fill" style="width:${percent}%; background:${typeColor}"></div>
                </div>
                <div style="width:30px; text-align:right; font-weight:bold;">${val}</div>
            </div>
        `;
    }).join('');

    modalBody.innerHTML = `
        <div style="text-align:center;">
            <img src="${data.sprites.other['showdown'].front_default || data.sprites.front_default}" 
                 style="height:100px; margin-bottom:10px;">
            <h2 style="text-transform:capitalize; color:${typeColor}">${data.name}</h2>
            
            <div style="display:flex; justify-content:space-around; margin: 15px 0; background:#f5f5f5; padding:10px; border-radius:10px;">
                <div><strong>${data.height / 10} m</strong><br><small>Taille</small></div>
                <div><strong>${data.weight / 10} kg</strong><br><small>Poids</small></div>
            </div>

            <div class="stats-container">
                ${statsHtml}
            </div>
        </div>
    `;
    modal.style.display = 'flex';
};

// Fermer la modale
document.querySelector('.close-btn').addEventListener('click', () => {
    modal.style.display = 'none';
});

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
};
