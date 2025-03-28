const slider1 = document.getElementById('slider1');
const slider2 = document.getElementById('slider2');
const slider1Value = document.getElementById('slider1Value');
const slider2Value = document.getElementById('slider2Value');
const currentCount = document.getElementById('currentCount');
const totalCount = document.getElementById('totalCount');
const filterCount = document.getElementById('filterCount');
const moviesList = document.getElementById('moviesList');

let allMovies = [];

async function loadMovies() {
    try {
        const response = await fetch('/api/movies');
        if (!response.ok) throw new Error('Failed to load movies');
        allMovies = await response.json();

        totalCount.textContent = allMovies.length;
        slider1.max = allMovies.length; 
        slider1.value = allMovies.length;
        slider2.value = 2025;
        slider1Value.textContent = slider1.value;
        slider2Value.textContent = slider2.value;

        filterMovies();

        slider1.addEventListener('input', () => {
            slider1Value.textContent = slider1.value;
            filterMovies();
        });

        slider2.addEventListener('input', () => {
            slider2Value.textContent = slider2.value;
            filterMovies();
        });
    } catch (error) {
        console.error('Error loading movies:', error);
    }
}

function filterMovies() {
    const movieAmount = parseInt(slider1.value, 10);
    const year = parseInt(slider2.value, 10);

    const yearFiltered = allMovies.filter(movie => movie.year <= year);
    
    const filteredMovies = movieAmount > 0 ? yearFiltered.slice(0, movieAmount) : [];

    currentCount.textContent = filteredMovies.length;
    filterCount.textContent = filteredMovies.length;

    displayMovies(filteredMovies);
}

function displayMovies(movies) {
    moviesList.innerHTML = '';

    movies.forEach(movie => {
        const movieElement = document.createElement('p');
        movieElement.textContent = `${movie.id}. ${movie.title} (${movie.year})`;
        moviesList.appendChild(movieElement);
    });
}

loadMovies();