document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION & GLOBAL VARIABLES ---
    const OPENWEATHER_API_KEY = '79fb366aa24d0365686c042d3e8d89d6'; // 👈 PASTE YOUR WEATHER KEY
    const OPENCAGE_API_KEY = 'f8f5bfd6ab654664b08b318d5ec25fae';   // 👈 PASTE YOUR GEOCODING KEY
    
    let map;
    let comparedCities = [];

    // --- DOM ELEMENT REFERENCES ---
    const searchInput = document.getElementById('city-search');
    const searchBtn = document.getElementById('search-btn');
    const menuToggle = document.getElementById('menu-toggle');
    const locationBtn = document.getElementById('location-btn');
    const sidebar = document.getElementById('sidebar');
    const closeSidebarBtn = document.getElementById('close-sidebar-btn');
    const sidebarBackdrop = document.getElementById('sidebar-backdrop');
    const comparisonList = document.getElementById('comparison-list');
    const shareBtn = document.getElementById('share-btn');
    
    // Modal elements
    const shareModal = document.getElementById('share-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const copyBtn = document.getElementById('copy-btn');
    const shareText = document.getElementById('share-text');
    
    // --- INITIALIZATION ---
    function initialize() {
        // Initialize map and disable default zoom control
        map = L.map('map', { zoomControl: false }).setView([20, 0], 2);
        // Add zoom control to the top right
        L.control.zoom({ position: 'topright' }).addTo(map);
        
        // Base satellite layer
        const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri',
            maxZoom: 19
        });

        // Label layer that goes on top
        const labelLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; CARTO',
            pane: 'shadowPane', // Ensures labels are always on top
            maxZoom: 19
        });

        // Add both layers to the map
        map.addLayer(satelliteLayer);
        map.addLayer(labelLayer);

        setupEventListeners();
        loadSideWeather();
    }

    // --- EVENT LISTENERS ---
    function setupEventListeners() {
        searchBtn.addEventListener('click', handleSearch);
        searchInput.addEventListener('keyup', (e) => { if (e.key === 'Enter') handleSearch(); });
        
        menuToggle.addEventListener('click', toggleSidebar);
        closeSidebarBtn.addEventListener('click', toggleSidebar);
        sidebarBackdrop.addEventListener('click', toggleSidebar);

        locationBtn.addEventListener('click', getCurrentLocationWeather);
        
        shareBtn.addEventListener('click', shareComparison);
        closeModalBtn.addEventListener('click', () => shareModal.classList.remove('visible'));
        copyBtn.addEventListener('click', copyShareText);
        
        document.body.addEventListener('click', (e) => {
            const addCompareBtn = e.target.closest('.add-compare-btn');
            const removeBtn = e.target.closest('.remove-btn');

            if (addCompareBtn) {
                const cityData = JSON.parse(addCompareBtn.dataset.city);
                addToComparison(cityData);
            }
            if (removeBtn) {
                const cityName = removeBtn.dataset.city;
                removeFromComparison(cityName);
            }
        });
    }

    // --- API & DATA HANDLING ---
    async function getCoordinates(placeName) {
        if (!OPENCAGE_API_KEY || OPENCAGE_API_KEY === 'YOUR_OPENCAGE_API_KEY_HERE') {
            alert("🚨 Please add your OpenCage Geocoding API key to script.js");
            return null;
        }
        const GEOCODE_URL = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(placeName)}&key=${OPENCAGE_API_KEY}&limit=1`;
        try {
            const response = await fetch(GEOCODE_URL);
            if (!response.ok) return null;
            const data = await response.json();
            if (data.results && data.results.length > 0) {
                return data.results[0].geometry; // Returns { lat, lng }
            }
            return null;
        } catch (error) {
            console.error("Geocoding error:", error);
            return null;
        }
    }

    async function getWeatherData(coords) {
        if (!OPENWEATHER_API_KEY || OPENWEATHER_API_KEY === 'YOUR_OPENWEATHER_API_KEY_HERE') {
            alert("🚨 Please add your OpenWeatherMap API key to script.js");
            return null;
        }
        const WEATHER_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lng}&appid=${OPENWEATHER_API_KEY}&units=metric`;
        try {
            const response = await fetch(WEATHER_URL);
            if (!response.ok) return null;
            const data = await response.json();
            return formatWeatherData(data);
        } catch (error) {
            console.error("Weather fetching error:", error);
            return null;
        }
    }

    function formatWeatherData(data) {
        return {
            name: data.name,
            country: data.sys.country,
            lat: data.coord.lat,
            lon: data.coord.lon,
            temp: Math.round(data.main.temp),
            desc: data.weather[0].description,
            icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
            humidity: data.main.humidity,
            wind: Math.round(data.wind.speed * 3.6),
            high: Math.round(data.main.temp_max),
            low: Math.round(data.main.temp_min)
        };
    }

    // --- UI & CORE FEATURES ---
    async function handleSearch() {
        const placeName = searchInput.value.trim();
        if (!placeName) return;

        const coords = await getCoordinates(placeName);
        if (coords) {
            const weatherData = await getWeatherData(coords);
            if (weatherData) {
                displayWeatherOnMap(weatherData);
                searchInput.value = '';
            } else {
                alert("Could not retrieve weather for that location.");
            }
        } else {
            alert("Location not found. Please try a different name.");
        }
    }

    function displayWeatherOnMap(data) {
        map.flyTo([data.lat, data.lon], 12);
        
        const escapedData = JSON.stringify(data).replace(/'/g, "&apos;");
        const popupContent = `
            <div class="weather-popup">
                <h3>${data.name}, ${data.country || ''}</h3>
                <div class="weather-popup-main">
                    <img src="${data.icon}" alt="${data.desc}">
                    <p>${data.temp}°C</p>
                </div>
                <p>${data.desc}. High: ${data.high}° Low: ${data.low}°.</p>
                <p><strong>Wind:</strong> ${data.wind} km/h | <strong>Humidity:</strong> ${data.humidity}%</p>
                <button class="add-compare-btn" data-city='${escapedData}' style="background-color: #3182ce;">Add to Compare</button>
            </div>
        `;

        L.popup().setLatLng([data.lat, data.lon]).setContent(popupContent).openOn(map);
    }
    
    async function getCurrentLocationWeather() {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }
        navigator.geolocation.getCurrentPosition(async (position) => {
            const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
            const weatherData = await getWeatherData(coords);
            if (weatherData) {
                displayWeatherOnMap(weatherData);
            }
        }, () => {
            alert("Unable to retrieve your location.");
        });
    }

    async function loadSideWeather() {
        const sideWeatherContainer1 = document.getElementById('left-weather');
        const sideWeatherContainer2 = document.getElementById('right-weather');
        
        const allCities = [
            'Paris', 'Singapore', 'Dubai', 'Istanbul', 'Kuala Lumpur', 'Seoul', 'Hong Kong', 
            'Barcelona', 'Amsterdam', 'Milan', 'Rome', 'Vienna', 'Shanghai', 'Bangkok', 'Osaka', 
            'Mecca', 'Pattaya', 'Agra', 'Miami', 'Los Angeles', 'Las Vegas', 'Prague', 
            'Berlin', 'Toronto', 'Rio de Janeiro'
        ];

        const shuffledCities = allCities.sort(() => 0.5 - Math.random());
        const citiesToFetch = shuffledCities.slice(0, 2);

        const promises = citiesToFetch.map(async (city) => {
            const coords = await getCoordinates(city);
            if (coords) return await getWeatherData(coords);
            return null;
        });

        const [weather1, weather2] = await Promise.all(promises);
        
        if (weather1) {
            sideWeatherContainer1.innerHTML = createSideWeatherHTML(weather1);
            sideWeatherContainer1.classList.add('glass-card');
        }
        if (weather2) {
            sideWeatherContainer2.innerHTML = createSideWeatherHTML(weather2);
            sideWeatherContainer2.classList.add('glass-card');
        }
    }

    function createSideWeatherHTML(data) {
        return `
            <img src="${data.icon}" alt="${data.desc}">
            <div class="side-weather-info">
                <strong>${data.name}</strong>
                <p>${data.temp}°C</p>
            </div>
        `;
    }

    // --- SIDEBAR & SHARE FEATURES ---
    function toggleSidebar() {
        sidebar.classList.toggle('open');
        sidebarBackdrop.classList.toggle('visible');
    }
    
    function shareComparison() {
        if (comparedCities.length === 0) return;

        let shareTextContent = "🌎 Weather Comparison:\n\n";
        comparedCities.forEach(city => {
            shareTextContent += `📍 ${city.name}: ${city.temp}°C (${city.desc})\n`;
        });

        if (navigator.share) {
            navigator.share({
                title: 'WeatherWise Comparison',
                text: shareTextContent,
            }).catch(console.error);
        } else {
            shareText.value = shareTextContent;
            shareModal.classList.add('visible');
        }
    }
    
    function copyShareText() {
        shareText.select();
        document.execCommand('copy');
        copyBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Copied!';
        setTimeout(() => {
            copyBtn.innerHTML = '<i class="fas fa-copy mr-2"></i>Copy to Clipboard';
        }, 2000);
    }
    
    function addToComparison(cityData) {
        if (comparedCities.some(city => city.name === cityData.name)) {
            alert(`${cityData.name} is already in the comparison list.`);
            return;
        }
        if (comparedCities.length >= 5) {
            alert("You can compare a maximum of 5 cities.");
            return;
        }
        comparedCities.push(cityData);
        updateComparisonList();
    }

    function removeFromComparison(cityName) {
        comparedCities = comparedCities.filter(city => city.name !== cityName);
        updateComparisonList();
    }
    
    function updateComparisonList() {
        if (comparedCities.length === 0) {
            comparisonList.innerHTML = '<p class="empty-list-msg">Add cities from the map to compare.</p>';
            shareBtn.disabled = true;
            return;
        }

        let listHTML = '';
        comparedCities.forEach(city => {
            listHTML += `
                <div class="city-item">
                    <div>
                        <strong>${city.name}</strong>
                        <p>${city.temp}°C, ${city.desc}</p>
                    </div>
                    <button class="remove-btn" data-city="${city.name}">&times;</button>
                </div>
            `;
        });
        comparisonList.innerHTML = listHTML;
        shareBtn.disabled = false;
    }
    
    // --- START THE APP ---
    initialize();
});