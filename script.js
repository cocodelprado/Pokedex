const API_URL = 'https://pokeapi.co/api/v2/pokemon/';
let currentPokemonData = null;

const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const resultContainer = document.getElementById('result-container');
const historyList = document.getElementById('history-list');
const randomList = document.getElementById('random-list');
const modal = document.getElementById('pokemon-modal');
const modalBody = document.getElementById('modal-body');
const closeModalBtn = document.getElementById('close-modal');

document.addEventListener('DOMContentLoaded', () => {
    afficherHistorique();
    genererRecommandations();
});

searchBtn.addEventListener('click', validerRecherche);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') validerRecherche();
});

function validerRecherche() {
    const query = searchInput.value.trim().toLowerCase();
    if (query !== "") {
        fetchPokemon(query);
    }
}

async function fetchPokemon(query) {
    try {
        resultContainer.innerHTML = '<p>Chargement...</p>';
        
        const response = await fetch(`${API_URL}${query}`);
        
        if (!response.ok) {
            throw new Error("Pokémon introuvable.");
        }

        const data = await response.json();
        currentPokemonData = data; 
        
        afficherResultat(data);
        ajouterHistorique(data.name, data.sprites.front_default);
        searchInput.value = '';

    } catch (error) {
        resultContainer.innerHTML = `<p style="color: red;">Erreur 404 : ${error.message}</p>`;
        currentPokemonData = null;
    }
}

function afficherResultat(data) {
    const types = data.types.map(t => t.type.name.toUpperCase()).join(' / ');
    
    resultContainer.innerHTML = `
        <img src="${data.sprites.front_default}" alt="${data.name}" class="pokemon-image">
        <h2 class="pokemon-name">#${data.id} ${data.name}</h2>
        <p>Type: ${types}</p>
        <button onclick="ouvrirModale()" style="margin-top: 20px;">VOIR STATS</button>
    `;
}

function ajouterHistorique(name, spriteUrl) {
    let historique = JSON.parse(localStorage.getItem('pokedexHistory')) || [];
    
    if (historique.length === 0 || historique[0].name !== name) {
        historique.unshift({ name, spriteUrl });
        
        if (historique.length > 5) {
            historique.pop(); 
        }
        
        localStorage.setItem('pokedexHistory', JSON.stringify(historique));
        afficherHistorique();
    }
}

function afficherHistorique() {
    const historique = JSON.parse(localStorage.getItem('pokedexHistory')) || [];
    historyList.innerHTML = '';

    historique.forEach(pokemon => {
        const li = document.createElement('li');
        li.innerHTML = `<img src="${pokemon.spriteUrl}" alt="${pokemon.name}"> <span>${pokemon.name.toUpperCase()}</span>`;
        li.addEventListener('click', () => fetchPokemon(pokemon.name));
        historyList.appendChild(li);
    });
}

async function genererRecommandations() {
    randomList.innerHTML = '<p style="font-size:10px; padding:10px;">Génération...</p>';
    
    try {
        const promises = [];
        for (let i = 0; i < 5; i++) {
            const randomId = Math.floor(Math.random() * 151) + 1; 
            promises.push(fetch(`${API_URL}${randomId}`).then(res => res.json()));
        }
        
        const randomPokemons = await Promise.all(promises);
        randomList.innerHTML = ''; 
        
        randomPokemons.forEach(data => {
            const li = document.createElement('li');
            li.innerHTML = `<img src="${data.sprites.front_default}" alt="${data.name}"> <span>${data.name.toUpperCase()}</span>`;
            li.addEventListener('click', () => fetchPokemon(data.name));
            randomList.appendChild(li);
        });

    } catch (error) {
        console.error(error);
    }
}

function ouvrirModale() {
    if (!currentPokemonData) return;

    const data = currentPokemonData;
    let statsHtml = `<h2 style="text-align:center; text-transform:uppercase; margin-bottom:15px;">${data.name}</h2>`;
    
    statsHtml += `<div style="text-align:center; margin-bottom: 20px;">
                    <p>Poids : ${data.weight / 10} kg</p>
                    <p>Taille : ${data.height / 10} m</p>
                  </div>`;

    data.stats.forEach(s => {
        statsHtml += `
            <div class="stat-row">
                <span>${s.stat.name.toUpperCase()}</span>
                <span>${s.base_stat}</span>
            </div>
        `;
    });

    modalBody.innerHTML = statsHtml;
    modal.classList.remove('hidden');
}

closeModalBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.add('hidden');
    }
});
