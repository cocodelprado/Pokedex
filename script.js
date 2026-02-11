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

// === 1. ANIMATION DE DEMARRAGE RAPIDE ===
window.addEventListener('load', () => {
    // Délai très court avant allumage (200ms)
    setTimeout(() => {
        screenDiv.classList.add('on');
        batteryLed.classList.add('on');
        
        // Texte s'affiche presque tout de suite après
        setTimeout(() => {
            typeWriter("READY", ecranNom);
            input.placeholder = "PRESS START";
        }, 300);
    }, 200);
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
        ecranImage.style.display = 'none';
        ecranTypes.innerText = "";
        
        // "LOADING" très rapide
        await typeWriter("LOAD...", ecranNom);
        
        const reponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
        if (!reponse.ok) throw new Error("Introuvable");
        const data = await reponse.json();

        currentPokemonData = data;

        ecranImage.src = data.sprites.front_default;
        ecranImage.style.display = 'block';
        
        // Ecriture du nom rapide
        typeWriter(data.name, ecranNom);

        const types = data.types.map(t => t.type.name.toUpperCase()).join('/');
        ecranTypes.innerText = `TYPE: ${types}`;
        input.value = "";
        input.placeholder = "SEARCH...";

        masquerDetails();

    } catch (e) {
        typeWriter("ERROR 404", ecranNom);
        ecranTypes.innerText = "?";
        currentPokemonData = null;
    }
}

// === 3. MACHINE A ECRIRE (VITESSE X2) ===
function typeWriter(text, element) {
    return new Promise(resolve => {
        element.innerText = "";
        text = text.toUpperCase();
        let i = 0;
        
        function type() {
            if (i < text.length) {
                element.innerText += text.charAt(i);
                i++;
                // 25ms au lieu de 50ms -> Ecriture très rapide
                setTimeout(type, 25); 
            } else {
                resolve();
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
