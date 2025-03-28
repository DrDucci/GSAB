// DOM Elements
const slider1 = document.getElementById('slider1');
const slider2 = document.getElementById('slider2');
const slider1Value = document.getElementById('slider1Value');
const slider2Value = document.getElementById('slider2Value');
const currentCount = document.getElementById('currentCount');
const totalCount = document.getElementById('totalCount');
const filterCount = document.getElementById('filterCount');
const moviesList = document.getElementById('moviesList');

// Carousel state
let slideIndexes = { movie: 1 };
let allMovies = [];

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', loadMovies);

async function loadMovies() {
    try {
        const response = await fetch('/api/movies');
        if (!response.ok) throw new Error('Failed to load movies');
        allMovies = await response.json();

        // Initialize UI
        totalCount.textContent = allMovies.length;
        slider1.max = allMovies.length; 
        slider1.value = allMovies.length;
        slider2.value = 2025;
        slider1Value.textContent = slider1.value;
        slider2Value.textContent = slider2.value;

        // Initialize carousel and filters
        initializeCarousel(allMovies);
        filterMovies();

        // Set up event listeners
        slider1.addEventListener('input', updateSlider1);
        slider2.addEventListener('input', updateSlider2);

    } catch (error) {
        console.error('Error loading movies:', error);
        showError();
    }
}

function initializeCarousel(movies) {
    const shuffledMovies = shuffleArray([...movies]);
    const slides = document.querySelectorAll('.movie-slide');
    
    slides.forEach((slide, i) => {
        const boxes = slide.querySelectorAll('.box');
        const movie1 = shuffledMovies[i * 2];
        const movie2 = shuffledMovies[i * 2 + 1];
        
        updateBoxContent(boxes[0], movie1);
        updateBoxContent(boxes[1], movie2);
    });
    
    showSlides(1, "movie");
}

function updateBoxContent(box, movie) {
    if (box && movie) {
        box.innerHTML = `
            <h2 class="movie-title">${movie.title}</h2>
            <p class="movie-year">${movie.year}</p>
            <p class="movie-rating">Rating: ${movie.rating}</p>
        `;
    }
}

function filterMovies() {
    const movieAmount = parseInt(slider1.value, 10);
    const year = parseInt(slider2.value, 10);

    const yearFiltered = allMovies.filter(movie => movie.year <= year);
    const filteredMovies = movieAmount > 0 ? yearFiltered.slice(0, movieAmount) : [];

    updateCounters(filteredMovies.length);
    displayMovies(filteredMovies);
    initializeCarousel(filteredMovies);
}

function updateSlider1() {
    slider1Value.textContent = slider1.value;
    filterMovies();
}

function updateSlider2() {
    slider2Value.textContent = slider2.value;
    filterMovies();
}

function updateCounters(count) {
    currentCount.textContent = count;
    filterCount.textContent = count;
}

function displayMovies(movies) {
    moviesList.innerHTML = '';
    movies.forEach(movie => {
        const movieElement = document.createElement('p');
        movieElement.textContent = `${movie.id}. ${movie.title} (${movie.year})`;
        moviesList.appendChild(movieElement);
    });
}

function showError() {
    moviesList.innerHTML = '<p>Error loading movie data. Please try again later.</p>';
}

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Carousel navigation functions
function plusSlides(n, carousel) {
    showSlides(slideIndexes[carousel] += n, carousel);
}

function showSlides(n, carousel) {
    const slides = document.getElementsByClassName(carousel + "-slide");
    
    // Reset position if out of bounds
    if (n > slides.length) slideIndexes[carousel] = 1;
    if (n < 1) slideIndexes[carousel] = slides.length;
    
    // Hide all slides
    Array.from(slides).forEach(slide => {
        slide.style.display = "none";
    });
    
    // Show current slide
    if (slides[slideIndexes[carousel] - 1]) {
        slides[slideIndexes[carousel] - 1].style.display = "block";
    }
}

// In initializeCarousel() function, modify updateBoxContent():
function updateBoxContent(box, movie) {
    if (box && movie) {
        box.innerHTML = `
            <h2 class="movie-title">${movie.title}</h2>
            <p class="movie-year">${movie.year}</p>
            <p class="movie-rating">Rating: ${movie.rating}</p>
        `;
        box.onclick = () => viewMovieDetails(movie);
    }
}

// Add this new function:
function viewMovieDetails(movie) {
    // Store movie data in sessionStorage
    sessionStorage.setItem('currentMovie', JSON.stringify(movie));
    // Redirect to movie details page
    window.location.href = 'movie.html';
}