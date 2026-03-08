const historique = [];
const HISTORIQUE_MAX = 3;



// Fonction de recherche de Pokémon
function searchPokemon() {
    // Dans la constante de récupération de valeur on ajoute des méthodes pour éviter les erreurs de saisie
    const searchInput = document.getElementById('searchInput').value.toLowerCase().trim();
    const resultContainer = document.getElementById('resultContainer');
  
 
    
// Fetch pour récupérer les données de l'API Pokémon
    if (searchInput) {
        fetch(`https://pokeapi.co/api/v2/pokemon/${searchInput}`)
            .then(response => {
                if (!response.ok) { // Si l'API ne renvoie pas une valeur correcte, on affiche une erreur
                    throw new Error('Pokémon non trouvé');
                }
                return response.json();
            })
            .then(data => {
                const pokemonName = data.name; // Nom du Pokémon
                const pokemonImage = data.sprites.front_default; // Image du Pokémon
                const pokemonTypes = data.types.map(typeInfo => typeInfo.type.name).join(', '); // Types du Pokémon
                const pokemonHeight = data.height; // Hauteur du Pokémon
                const pokemonWeight = data.weight; // Poids du Pokémon
                document.getElementById('logo').style.opacity = "0.4"; // Pour que le logo soit moins visible pendant la recherche
                document.getElementById('footer').style.opacity = "0"; // Rendre le footer invisible pendant la recherche
                ajouterHistorique(pokemonName); // On ajoute le nom du Pokémon à l'historique
                
                
                resultContainer.innerHTML = `
                <div class="pokemon-card">
                    <h2 class="pokemon-name">${pokemonName}</h2>
                    <img class="pokemon-image" src="${pokemonImage}" alt="${pokemonName}">
                    <p class="pokemon-types">Types: ${pokemonTypes}</p>
                    <p class="pokemon-height">Hauteur: ${pokemonHeight/10}cm</p>
                    <p class="pokemon-weight">Poids: ${pokemonWeight/10}kg</p>
                    <div class="pokemon-stats">
                    <h3>Stats</h3>
                    <ul>
                        ${data.stats.map(statInfo => `<li>${statInfo.stat.name}: ${statInfo.base_stat}</li>`).join('')} 
                    </ul>
                    </div>
                    </div>
    `;       })    //On injecte les valeurs du Pokémon directement dans le HTML + Structure des stats spéciale
            .catch(error => {
                resultContainer.innerHTML = `<p>${error.message}</p>`; // Lorsqu'il y a un .then, il y a forcément un .catch
            });
    } else {
        alert('Veuillez entrer le nom d\'un Pokémon'); // Si l'utilisateur n'entre rien, on affiche une alerte
        }
}
// Méthode pour lancer la recherche avec le clique de la souris ou la touche "Entrée" du clavier
const searchButton = document.getElementById('searchButton');
const searchInput = document.getElementById('searchInput');

searchButton.addEventListener('click', searchPokemon);
searchInput.addEventListener('keypress', function (event) {
  if (event.key === 'Enter') {
    searchPokemon();
  }
});

// Ajout du Pokémon à l'historique 
function ajouterHistorique(pokemonName) {
    historique.push(pokemonName); // On ajoute le nom du Pokémon à l'historique
    const historiqueContainer = document.getElementById('historiqueContainer');
    historiqueContainer.innerHTML = '<h3>Historique des recherches :</h3><ul>' +
        historique.map(name => `<li>${name}</li>`).join('') + // On affiche l'historique des recherches sous forme de liste
        '</ul>';
    if (historique.length > HISTORIQUE_MAX) { // Si l'historique dépasse la limite, on supprime les plus anciens
        historique.length = 0;
        localStorage.removeItem('historique');
    }

}
