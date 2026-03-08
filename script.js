const historique = [];
const HISTORIQUE_MAX = 5; // Limite fixée à 5 pour les données récentes
const SAUVAGES_MAX = 3;   // Réduit à 3 pour les espèces sauvages

// Lancement automatique au démarrage de la page
window.onload = function() {
    searchPokemon('pikachu'); // Charge Pikachu dès le début pour éviter l'écran vide
    chargerSauvages(); // Remplit le panneau des Pokémon aléatoires
};

// Fonction de recherche de Pokémon (Modifiée pour accepter un clic ou le texte tapé)
function searchPokemon(nomOuId) {
    // Si on a cliqué sur un nom, on l'utilise, sinon on prend la valeur de l'input
    let valeurRecherche = nomOuId;
    if (!valeurRecherche) {
        // Dans la constante de récupération de valeur on ajoute des méthodes pour éviter les erreurs de saisie
        valeurRecherche = document.getElementById('search-input').value.toLowerCase().trim();
    }
    
    const ecranNom = document.getElementById('poke-name');
    const ecranImage = document.getElementById('poke-image');
    const ecranTypes = document.getElementById('poke-types');
  
    // Fetch pour récupérer les données de l'API Pokémon
    if (valeurRecherche) {
        ecranNom.innerText = "LOAD..."; // Petit texte de chargement
        ecranImage.style.display = "none";

        fetch(`https://pokeapi.co/api/v2/pokemon/${valeurRecherche}`)
            .then(response => {
                if (!response.ok) { // Si l'API ne renvoie pas une valeur correcte, on affiche une erreur
                    throw new Error('Pokémon non trouvé');
                }
                return response.json();
            })
            .then(data => {
                const pokemonName = data.name; // Nom du Pokémon
                const pokemonImage = data.sprites.front_default; // Image du Pokémon
                const pokemonTypes = data.types.map(typeInfo => typeInfo.type.name).join(' / '); // Types du Pokémon
                
                // On injecte les valeurs du Pokémon directement dans la GameBoy
                ecranNom.innerText = pokemonName.toUpperCase();
                ecranImage.src = pokemonImage;
                ecranImage.style.display = "block";
                ecranTypes.innerText = `TYPE: ${pokemonTypes.toUpperCase()}`;
                
                // On stocke les stats dans une variable globale pour le bouton A
                window.pokemonStats = data.stats; 

                ajouterHistorique(pokemonName, pokemonImage); // On ajoute le nom et l'image à l'historique
                masquerDetails(); // On s'assure d'être sur l'écran principal
                document.getElementById('search-input').value = ""; // On vide la barre de recherche
            })
            .catch(error => {
                ecranNom.innerText = "ERROR 404"; // Lorsqu'il y a un .then, il y a forcément un .catch
                ecranTypes.innerText = error.message;
            });
    } else {
        alert('Veuillez entrer le nom d\'un Pokémon'); // Si l'utilisateur n'entre rien, on affiche une alerte
    }
}

// Méthode pour lancer la recherche avec la touche "Entrée" du clavier
const searchInputField = document.getElementById('search-input');
searchInputField.addEventListener('keypress', function (event) {
  if (event.key === 'Enter') {
    searchPokemon();
  }
});

// Ajout du Pokémon à l'historique 
function ajouterHistorique(pokemonName, pokemonImage) {
    // On vérifie qu'il n'est pas déjà le premier de la liste
    if (historique.length === 0 || historique[0].name !== pokemonName) {
        historique.unshift({name: pokemonName, img: pokemonImage}); // On ajoute au début
    }
    
    if (historique.length > HISTORIQUE_MAX) { // Si l'historique dépasse la limite, on supprime le plus ancien
        historique.pop();
    }
    
    const historiqueContainer = document.getElementById('history-list');
    historiqueContainer.innerHTML = historique.map(poke => 
        `<li onclick="searchPokemon('${poke.name}')"><img src="${poke.img}"> <span>${poke.name.toUpperCase()}</span></li>`
    ).join(''); // On affiche l'historique sous forme de liste
}

// Fonction pour afficher des Pokémon aléatoires dans le panneau de droite (Dashboard)
function chargerSauvages() {
    const randomList = document.getElementById('random-list');
    randomList.innerHTML = "";
    
    for (let i = 0; i < SAUVAGES_MAX; i++) { // Utilisation de la constante pour limiter à 3
        let randomId = Math.floor(Math.random() * 151) + 1;
        fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`)
            .then(response => response.json())
            .then(data => {
                randomList.innerHTML += `<li onclick="searchPokemon('${data.name}')"><img src="${data.sprites.front_default}"> <span>${data.name.toUpperCase()}</span></li>`;
            });
    }
}

// ==========================================
// GESTION DES BOUTONS DE LA GAMEBOY 
// ==========================================

// Croix directionnelle (Génère un Pokémon au hasard sur la console)
document.getElementById('btn-random').addEventListener('click', function() {
    let randomId = Math.floor(Math.random() * 151) + 1;
    searchPokemon(randomId);
});

// Bouton A (Vert) : Afficher les stats
document.getElementById('btn-details').addEventListener('click', function() {
    if (window.pokemonStats) {
        const statsList = document.getElementById('stats-list');
        // Structure des stats spéciale (injectée via .map)
        statsList.innerHTML = window.pokemonStats.map(statInfo => `<div class="stat-line"><span>${statInfo.stat.name.toUpperCase()}</span><span>${statInfo.base_stat}</span></div>`).join('');
        
        document.getElementById('ui-container').classList.add('hidden');
        document.getElementById('details-screen').classList.remove('hidden');
    }
});

// Bouton B (Rouge) : Retour à l'image
document.getElementById('btn-back').addEventListener('click', masquerDetails);

function masquerDetails() {
    document.getElementById('details-screen').classList.add('hidden');
    document.getElementById('ui-container').classList.remove('hidden');
}
