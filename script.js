// ELEMENTS DU DOM
const ecranNom = document.getElementById('poke-name');
const ecranImage = document.getElementById('poke-image');
const ecranTypes = document.getElementById('poke-types');
const input = document.getElementById('search-input');

// Ecrans (Principal et Détails)
const ecranPrincipal = document.getElementById('ui-container');
const ecranDetails = document.getElementById('details-screen');
const listeStats = document.getElementById('stats-list');

// Boutons
const btnDetails = document.getElementById('btn-details'); // VERT (A)
const btnRetour = document.getElementById('btn-back');     // ROUGE (B)
const btnRandom = document.getElementById('btn-random');   // CROIX

// Variable pour stocker les infos du Pokemon actuel
let currentPokemonData = null;

// ========================
// 1. RECHERCHE
// ========================
input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const texte = input.value.toLowerCase();
        if(texte) chercherPokemon(texte);
    }
});

btnRandom.addEventListener('click', () => {
    const idHasard = Math.floor(Math.random() * 151) + 1;
    chercherPokemon(idHasard);
});

async function chercherPokemon(query) {
    try {
        ecranNom.innerText = "LOADING...";
        
        const reponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
        if (!reponse.ok) throw new Error("Introuvable");
        const data = await reponse.json();

        // On sauvegarde les données pour le bouton vert
        currentPokemonData = data;

        // Affichage Principal
        ecranNom.innerText = data.name;
        ecranImage.src = data.sprites.front_default;
        const types = data.types.map(t => t.type.name.toUpperCase()).join('/');
        ecranTypes.innerText = `TYPE: ${types}`;
        input.value = "";

        // Si on était sur l'écran détails, on revient au principal
        masquerDetails();

    } catch (e) {
        ecranNom.innerText = "ERROR";
        ecranTypes.innerText = "NOT FOUND";
        ecranImage.src = ""; // Image vide
        currentPokemonData = null;
    }
}

// ========================
// 2. GESTION DES DETAILS (BOUTONS)
// ========================

// BOUTON VERT (A) : AFFICHER DETAILS
btnDetails.addEventListener('click', () => {
    if (currentPokemonData) {
        afficherDetails(currentPokemonData);
    }
});

// BOUTON ROUGE (B) : RETOUR
btnRetour.addEventListener('click', () => {
    masquerDetails();
});


function afficherDetails(data) {
    // On génère le HTML des stats
    // HP, ATK, DEF, SPD
    const stats = data.stats;
    let html = '';
    
    // Petite traduction manuelle des stats
    const nomsStats = {
        'hp': 'PV',
        'attack': 'ATK',
        'defense': 'DEF',
        'special-attack': 'S-ATK',
        'special-defense': 'S-DEF',
        'speed': 'VIT'
    };

    stats.forEach(s => {
        const nom = nomsStats[s.stat.name] || s.stat.name.toUpperCase();
        html += `
            <div class="stat-line">
                <span>${nom}</span>
                <span>${s.base_stat}</span>
            </div>
        `;
    });

    listeStats.innerHTML = html;

    // On bascule les écrans
    ecranPrincipal.classList.add('hidden');
    ecranDetails.classList.remove('hidden');
}

function masquerDetails() {
    ecranDetails.classList.add('hidden');
    ecranPrincipal.classList.remove('hidden');
}

// Initialisation
chercherPokemon('pikachu');
