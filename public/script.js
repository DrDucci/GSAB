/**
 * Movie App - Client Side Script
 * Kommunikation med: http://localhost:3000/api/movies
 */

// ========== DOM Element ========== //
const slider1 = document.getElementById('slider1');
const slider2 = document.getElementById('slider2');
const slider1Value = document.getElementById('slider1Value');
const slider2Value = document.getElementById('slider2Value');
const currentCount = document.getElementById('currentCount');
const totalCount = document.getElementById('totalCount');
const filterCount = document.getElementById('filterCount');
const moviesList = document.getElementById('moviesList');
const searchTerm = document.querySelector('.searchTerm');
const searchButton = document.querySelector('.searchButton');

// ========== App State ========== //
let allMovies = [];
let slideIndexes = { movie: 1 };

// ========== Initiera App ========== //
document.addEventListener('DOMContentLoaded', () => {
  loadMovies();
  setupEventListeners();
});

// ========== Huvudfunktioner ========== //

/** Hämtar filmer från API */
async function loadMovies() {
  try {
    const response = await fetch('http://localhost:3000/api/movies');
    
    if (!response.ok) {
      throw new Error(`API-svar: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      throw new Error('Ogiltigt dataformat från API');
    }

    allMovies = data;
    updateUI();
    
  } catch (error) {
    console.error('Fel vid hämtning av filmer:', error);
    showError(`Kunde inte ladda filmer: ${error.message}`);
    
    // Fallback: Ladda från lokal JSON om API misslyckas
    try {
      const localResponse = await fetch('movies.json');
      const localData = await localResponse.json();
      allMovies = localData;
      updateUI();
    } catch (localError) {
      console.error('Fel vid hämtning av lokal data:', localError);
    }
  }
}

/** Uppdaterar gränssnittet med filmdata */
function updateUI() {
  totalCount.textContent = allMovies.length;
  slider1.max = allMovies.length;
  slider1.value = allMovies.length;
  slider2.value = new Date().getFullYear(); // Sätt till aktuellt år
  updateSliderValues();
  filterMovies();
}

/** Filtrerar filmer baserat på användarval */
function filterMovies() {
  const count = parseInt(slider1.value);
  const maxYear = parseInt(slider2.value);

  const filtered = allMovies
    .filter(movie => movie.year <= maxYear)
    .slice(0, count);

  updateCounters(filtered.length);
  renderMovies(filtered);
  renderCarousel(filtered);
}

// ========== Renderingsfunktioner ========== //

/** Visar filmer i listan */
function renderMovies(movies) {
  moviesList.innerHTML = movies.map(movie => `
    <div class="movie-item" onclick="viewMovieDetails(${movie.id})">
      <h3>${movie.title}</h3>
      <p>År: ${movie.year} | Betyg: ${movie.rating}</p>
    </div>
  `).join('');
}

/** Renderar karusellen */
function renderCarousel(movies) {
  const shuffled = shuffleArray([...movies]);
  const slides = document.querySelectorAll('.movie-slide');
  
  slides.forEach((slide, i) => {
    const [box1, box2] = slide.querySelectorAll('.box');
    const movie1 = shuffled[i * 2];
    const movie2 = shuffled[i * 2 + 1];
    
    renderMovieBox(box1, movie1);
    renderMovieBox(box2, movie2);
  });
  
  showSlide(1, "movie");
}

/** Fyller en box med filmdata */
function renderMovieBox(box, movie) {
  if (!box || !movie) return;
  
  box.innerHTML = `
    <h2>${movie.title}</h2>
    <p>År: ${movie.year}</p>
    <p>Betyg: ${movie.rating}</p>
  `;
  box.onclick = () => viewMovieDetails(movie);
}

// ========== Händelsehanterare ========== //

/** Konfigurerar event listeners */
function setupEventListeners() {
  // Sliders
  slider1.addEventListener('input', () => {
    updateSliderValues();
    filterMovies();
  });
  
  slider2.addEventListener('input', () => {
    updateSliderValues();
    filterMovies();
  });

  // Sökfunktion
  searchButton.addEventListener('click', handleSearch);
  searchTerm.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
  });
}

/** Hanterar sökning */
function handleSearch() {
  const query = searchTerm.value.trim().toLowerCase();
  
  if (!query) {
    filterMovies();
    return;
  }

  const results = allMovies.filter(movie => 
    movie.title.toLowerCase().includes(query)
  );

  if (results.length > 0) {
    renderMovies(results);
  } else {
    showError('Inga filmer hittades');
  }
}

// ========== Hjälpfunktioner ========== //

/** Visar felmeddelande */
function showError(message) {
  moviesList.innerHTML = `<div class="error">${message}</div>`;
}

/** Uppdaterar räknare */
function updateCounters(count) {
  currentCount.textContent = count;
  filterCount.textContent = count;
}

/** Uppdaterar slider-värden */
function updateSliderValues() {
  slider1Value.textContent = slider1.value;
  slider2Value.textContent = slider2.value;
}

/** Visa filmdetaljer */

  sessionStorage.setItem('currentMovie', JSON.stringify(movie));
  window.location.href = 'movie.html';
// Update the viewMovieDetails function
// Ersätt din nuvarande viewMovieDetails-funktion med denna:
function viewMovieDetails(movie) {
  if (!movie || !movie.id) {
    console.error('Invalid movie object:', movie);
    return;
  }
  
  // Spara filmen i sessionStorage som backup
  sessionStorage.setItem('currentMovie', JSON.stringify(movie));
  
  // Hämta detaljer från API
  fetch(`http://localhost:3000/api/movies/${movie.id}`)
    .then(response => {
      if (!response.ok) throw new Error('Movie not found');
      return response.json();
    })
    .then(movieData => {
      // Uppdatera med data från API om det finns
      sessionStorage.setItem('currentMovie', JSON.stringify(movieData));
      window.location.href = 'movie.html';
    })
    .catch(error => {
      console.error('Error fetching movie details:', error);
      // Använd sessionStorage-data om API-anropet misslyckas
      window.location.href = 'movie.html';
    });
}

/** Blandar array (Fisher-Yates) */
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Karusell-navigering */
function showSlide(n, carousel) {
  const slides = document.querySelectorAll(`.${carousel}-slide`);
  slideIndexes[carousel] = n > slides.length ? 1 : n < 1 ? slides.length : n;
  
  slides.forEach(slide => slide.style.display = 'none');
  slides[slideIndexes[carousel] - 1].style.display = 'block';
}

// Globala funktioner för karusell-kontroller
window.plusSlides = (n, carousel) => showSlide(slideIndexes[carousel] + n, carousel);