const API_URL = 'https://pokeapi.co/api/v2/pokemon/';
let currentPokemonData = null;

const ecranNom = document.getElementById('poke-name');
const ecranImage = document.getElementById('poke-image');
const ecranTypes = document.getElementById('poke-types');
const input = document.getElementById('search-input');
const batteryLed = document.querySelector('.battery-led');

const ecranPrincipal = document.getElementById('ui-container');
const ecranDetails = document.getElementById('details-screen');
const listeStats = document.getElementById('stats-list');

const historyList = document.getElementById('history-list');
const randomList = document.getElementById('random-list');

const btnDetails = document.getElementById('btn-details');
const btnRetour = document.getElementById('btn-back');
const btnRandom = document.getElementById('btn-random');

window.addEventListener('load', () => {
    batteryLed.classList.add('on');
    afficherHistorique();
    genererRecommandations();
    chercherPokemon('squirtle');
});

input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const texte = input.value.trim().toLowerCase();
        if(texte) chercherPokemon(texte);
    }
});

btnRandom.addEventListener('click', () => {
    const idHasard = Math.floor(Math.random() * 151) + 1;
    chercherPokemon(idHasard);
});

async function chercherPokemon(query) {
    try {
        ecranImage.style.display = 'none';
        ecranNom.innerText = "LOAD...";
        ecranTypes.innerText = "";
        
        const response = await fetch(`${API_URL}${query}`);
        if (!response.ok) throw new Error("Erreur");
        
        const data = await response.json();
        currentPokemonData = data;
        
        ecranImage.src = data.sprites.front_default;
        ecranImage.style.display = 'block';
        ecranNom.innerText = data.name;
        
        const types = data.types.map(t => t.type.name.toUpperCase()).join('/');
        ecranTypes.innerText = `TYPE: ${types}`;
        
        input.value = "";
        masquerDetails();
        
        ajouterHistorique(data.name, data.sprites.front_default);

    } catch (e) {
        ecranNom.innerText = "ERREUR 404";
        ecranTypes.innerText = "";
        currentPokemonData = null;
    }
}

function ajouterHistorique(name, spriteUrl) {
    let historique = JSON.parse(localStorage.getItem('gbcHistory')) || [];
    if (historique.length === 0 || historique[0].name !== name) {
        historique.unshift({ name, spriteUrl });
        if (historique.length > 5) historique.pop();
        localStorage.setItem('gbcHistory', JSON.stringify(historique));
        afficherHistorique();
    }
}

function afficherHistorique() {
    const historique = JSON.parse(localStorage.getItem('gbcHistory')) || [];
    historyList.innerHTML = '';
    historique.forEach(pokemon => {
        const li = document.createElement('li');
        li.innerHTML = `<img src="${pokemon.spriteUrl}"> <span>${pokemon.name.toUpperCase()}</span>`;
        li.addEventListener('click', () => chercherPokemon(pokemon.name));
        historyList.appendChild(li);
    });
}

async function genererRecommandations() {
    randomList.innerHTML = '<li style="justify-content:center;">Chargement...</li>';
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
            li.innerHTML = `<img src="${data.sprites.front_default}"> <span>${data.name.toUpperCase()}</span>`;
            li.addEventListener('click', () => chercherPokemon(data.name));
            randomList.appendChild(li);
        });
    } catch (error) {
        randomList.innerHTML = '<li>Erreur de réseau</li>';
    }
}

btnDetails.addEventListener('click', () => {
    if (currentPokemonData) afficherDetails(currentPokemonData);
});

btnRetour.addEventListener('click', () => masquerDetails());

function afficherDetails(data) {
    const nomsStats = {'hp':'PV', 'attack':'ATK', 'defense':'DEF', 'special-attack':'S-ATK', 'special-defense':'S-DEF', 'speed':'VIT'};
    let html = '';
    data.stats.forEach(s => {
        const nom = nomsStats[s.stat.name] || s.stat.name.toUpperCase();
        html += `<div class="stat-line"><span>${nom}</span><span>${s.base_stat}</span></div>`;
    });
    listeStats.innerHTML = html;
    ecranPrincipal.classList.add('hidden');
    ecranDetails.classList.remove('hidden');
}

function masquerDetails() {
    ecranDetails.classList.add('hidden');
    ecranPrincipal.classList.remove('hidden');
}
