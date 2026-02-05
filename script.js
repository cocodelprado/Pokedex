// ELEMENTS DOM
const ecranNom = document.getElementById('poke-name');
const ecranImage = document.getElementById('poke-image');
const ecranTypes = document.getElementById('poke-types');
const input = document.getElementById('search-input');
const screenDiv = document.getElementById('screen');
const batteryLed = document.querySelector('.battery-led');

const ecranPrincipal = document.getElementById('ui-container');
const ecranDetails = document.getElementById('details-screen');
const listeStats = document.getElementById('stats-list');

const btnDetails = document.getElementById('btn-details');
const btnRetour = document.getElementById('btn-back');
const btnRandom = document.getElementById('btn-random');

let currentPokemonData = null;

// === 1. ANIMATION DE DEMARRAGE (BOOT) ===
window.addEventListener('load', () => {
    setTimeout(() => {
        screenDiv.classList.add('on'); // L'écran s'ouvre
        batteryLed.classList.add('on'); // La LED s'allume
        
        // Petit délai avant d'afficher le texte
        setTimeout(() => {
            typeWriter("READY...", ecranNom);
        }, 500);
    }, 500);
});

// === 2. FONCTIONS DE RECHERCHE ===
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
        ecranImage.style.display = 'none'; // On cache l'image pdt chargement
        ecranTypes.innerText = "";
        
        // Effet d'écriture pour le chargement
        await typeWriter("LOADING...", ecranNom);
        
        const reponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
        if (!reponse.ok) throw new Error("Introuvable");
        const data = await reponse.json();

        currentPokemonData = data;

        // Affichage final
        ecranImage.src = data.sprites.front_default;
        ecranImage.style.display = 'block'; // On affiche l'image
        
        // Effet d'écriture pour le nom
        typeWriter(data.name, ecranNom);

        const types = data.types.map(t => t.type.name.toUpperCase()).join('/');
        ecranTypes.innerText = `TYPE: ${types}`;
        input.value = "";
        input.placeholder = "SEARCH...";

        masquerDetails();

    } catch (e) {
        typeWriter("ERROR 404", ecranNom);
        ecranTypes.innerText = "NOT FOUND";
        currentPokemonData = null;
    }
}

// === 3. EFFET MACHINE A ECRIRE (STYLE RETRO) ===
function typeWriter(text, element) {
    return new Promise(resolve => {
        element.innerText = ""; // On vide
        text = text.toUpperCase();
        let i = 0;
        
        function type() {
            if (i < text.length) {
                element.innerText += text.charAt(i);
                i++;
                setTimeout(type, 50); // Vitesse de frappe (50ms)
            } else {
                resolve(); // On dit que c'est fini
            }
        }
        type();
    });
}

// === 4. GESTION DETAILS ===
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
