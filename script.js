// assigning values 
const apiKey = "04239c8b1471c42691b30039b23029fa";
const city = document.getElementById('city');
const search_button = document.getElementById('search_button');
const location_btn = document.getElementById('location');
const weather1 = document.getElementById('weather1');
const errorBox = document.getElementById('errorBox');
const alertBox = document.getElementById('alertBox');
const recentDropdown = document.getElementById('recentDropdown');
const tempToggle = document.getElementById('tempToggle');
const mainBody = document.getElementById('mainBody');
const forecastContainer = document.getElementById('forecastContainer');
const RECENT_SEARCHES_KEY = 'recentSearchedCities';
const TEMP_UNIT_KEY = 'temperatureUnit';
const MAX_RECENT = 15;

function getTempUnit() {
  return localStorage.getItem(TEMP_UNIT_KEY) || 'C';
}

function setTempUnit(unit) {
  localStorage.setItem(TEMP_UNIT_KEY, unit);
  tempToggle.textContent = unit === 'C' ? '°C / °F' : '°F / °C';
  if (weather1.innerHTML && weather1.innerHTML !== 'Search a city or use your current location.') {
    renderWeatherDisplay(lastWeatherData);
  }
}

function celsiusToFahrenheit(celsius) {
  return Math.round((celsius * 9/5 + 32) * 10) / 10;
}

function getWeatherEmoji(description, main) {
  const desc = description.toLowerCase();
  const mainType = main.toLowerCase();
  
  if (mainType.includes('clear') || mainType.includes('sunny')) return '☀️';
  if (mainType.includes('cloud')) return '☁️';
  if (mainType.includes('rain') || mainType.includes('drizzle')) return '🌧️';
  if (mainType.includes('thunderstorm')) return '⛈️';
  if (mainType.includes('snow')) return '❄️';
  if (mainType.includes('mist') || mainType.includes('fog')) return '🌫️';
  if (mainType.includes('wind')) return '💨';
  
  return '🌤️';
}

function checkTemperatureAlert(temp) {
  if (temp > 40) {
    return {
      show: true,
      message: `⚠️ EXTREME HEAT ALERT: Temperature is ${temp}°C! Stay hydrated and avoid prolonged sun exposure.`
    };
  }
  if (temp < -20) {
    return {
      show: true,
      message: `❄️ EXTREME COLD ALERT: Temperature is ${temp}°C! Bundle up and protect exposed skin.`
    };
  }
  if (temp > 35) {
    return {
      show: true,
      message: `🔥 HIGH TEMPERATURE ALERT: Temperature is ${temp}°C. Be cautious in the heat.`
    };
  }
  
  return { show: false, message: '' };
}

function displayAlert(temp) {
  const alert = checkTemperatureAlert(temp);
  if (alert.show) {
    alertBox.textContent = alert.message;
    alertBox.classList.remove('hidden');
  } else {
    alertBox.classList.add('hidden');
  }
}

let lastWeatherData = null;

function fetch_5day_forecast(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
    .then(res => {
      if (!res.ok) throw new Error('Unable to fetch forecast data');
      return res.json();
    })
    .then(data => {
      display_5day_forecast(data);
    })
    .catch(err => {
      console.error('Forecast error:', err);
      forecastContainer.innerHTML = '<p class="text-gray-600">Unable to load 5-day forecast</p>';
    });
}

function display_5day_forecast(data) {
  if (!data || !data.list) {
    forecastContainer.innerHTML = '<p class="text-gray-600">No forecast data available</p>';
    return;
  }

  const dailyForecasts = {};
  
  data.list.forEach(item => {
    const date = new Date(item.dt * 1000);
    const day = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    if (!dailyForecasts[day] || date.getHours() === 12) {
      dailyForecasts[day] = item;
    }
  });

  const forecastArray = Object.entries(dailyForecasts).slice(0, 5);

  forecastContainer.innerHTML = '';

  if (forecastArray.length === 0) {
    forecastContainer.innerHTML = '<p class="text-gray-600">No forecast data available</p>';
    return;
  }

  forecastArray.forEach(([day, forecast]) => {
    let temp = Math.round(forecast.main.temp * 10) / 10;

    const humidity = forecast.main.humidity;
    const windSpeed = Math.round(forecast.wind.speed * 10) / 10;
    const description = forecast.weather[0] ? forecast.weather[0].description : 'No description';
    const mainType = forecast.weather[0] ? forecast.weather[0].main : '';
    const weatherEmoji = getWeatherEmoji(description, mainType);
    
    const card = document.createElement('div');
    card.className = 'forecast-card';
    card.innerHTML = `
      <div class="forecast-date">${day}</div>
      <div class="forecast-condition">${weatherEmoji} ${description.charAt(0).toUpperCase() + description.slice(1)}</div>
      
      <div class="forecast-weather">
        <div class="forecast-item">
          <div class="forecast-icon">🌡️</div>
          <div class="forecast-label">Temp</div>
          <div class="forecast-value">${temp}°C</div>
        </div>
        
        <div class="forecast-item">
          <div class="forecast-icon">💨</div>
          <div class="forecast-label">Wind</div>
          <div class="forecast-value">${windSpeed} m/s</div>
        </div>
        
        <div class="forecast-item">
          <div class="forecast-icon">💧</div>
          <div class="forecast-label">Humidity</div>
          <div class="forecast-value">${humidity}%</div>
        </div>
      </div>
    `;
    
    forecastContainer.appendChild(card);
  });
}

let lastForecastCoords = null;

function renderWeatherDisplay(data) {
  lastWeatherData = data;
  
  const tempUnit = getTempUnit();
  const name = data.name || 'Unknown';
  const country = data.sys && data.sys.country ? `, ${data.sys.country}` : '';
  
  let temp = Math.round(data.main.temp * 10) / 10;
  let feels_like = Math.round(data.main.feels_like * 10) / 10;
  
  if (tempUnit === 'F') {
    temp = celsiusToFahrenheit(temp);
    feels_like = celsiusToFahrenheit(feels_like);
  }
  
  const humidity = data.main.humidity;
  const desc = data.weather && data.weather[0] ? data.weather[0].description : 'No description';
  const mainType = data.weather && data.weather[0] ? data.weather[0].main : '';
  const windSpeed = data.wind && data.wind.speed ? Math.round(data.wind.speed * 10) / 10 : 'N/A';
  const windDeg = data.wind && data.wind.deg !== undefined ? data.wind.deg : null;

  if (name && name !== 'Unknown') city.value = name;

  let windDirection = 'N/A';
  if (windDeg !== null) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(windDeg / 22.5) % 16;
    windDirection = directions[index];
  }

  const emoji = getWeatherEmoji(desc, mainType);
  
  displayAlert(data.main.temp);

  weather1.innerHTML = `
    <div class="city-name">${emoji} ${name}${country}</div>
    <div class="condition">${desc.charAt(0).toUpperCase() + desc.slice(1)}</div>
    
    <div class="weather-grid">
      <div class="weather-item">
        <div class="label">Temperature</div>
        <div class="value">${temp}°${tempUnit}</div>
      </div>
      
      <div class="weather-item">
        <div class="label">Feels Like</div>
        <div class="value">${feels_like}°${tempUnit}</div>
      </div>
      
      <div class="weather-item">
        <div class="label">Humidity</div>
        <div class="value">${humidity}%</div>
      </div>
      
      <div class="weather-item">
        <div class="label">Wind Speed</div>
        <div class="value">${windSpeed} m/s</div>
      </div>
  `;
  clearError();
}

function error_msg(msg, type = 'error') {
  if (!msg || msg.trim() === '') return;
  
  errorBox.textContent = msg;
  errorBox.className = type;
  errorBox.classList.remove('hidden');
  
  if (type === 'success') {
    setTimeout(() => {
      errorBox.classList.add('hidden');
    }, 5000);
  }
}

function clearError() {
  errorBox.classList.add('hidden');
  errorBox.textContent = '';
}

function validateCityInput(cityName) {
  const trimmed = cityName.trim();
  
  if (!trimmed) {
    error_msg('Please enter a city name.', 'warning');
    return false;
  }
  
  if (trimmed.length < 2) {
    error_msg('City name must be at least 2 characters long.', 'warning');
    return false;
  }
  
  if (trimmed.length > 100) {
    error_msg('City name is too long. Please enter a shorter name.', 'warning');
    return false;
  }
  
  const validCityPattern = /^[a-zA-Z\s\-']+$/;
  if (!validCityPattern.test(trimmed)) {
    error_msg('City name contains invalid characters. Use only letters, spaces, hyphens, and apostrophes.', 'warning');
    return false;
  }
  
  return true;
}

function getRecentSearches() {
  const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
  return stored ? JSON.parse(stored) : [];
}

function addToRecentSearches(cityName) {
  let recent = getRecentSearches();
  recent = recent.filter(c => c.toLowerCase() !== cityName.toLowerCase());
  recent.unshift(cityName);
  recent = recent.slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent));
  renderDropdown();
}

function renderDropdown() {
  const recent = getRecentSearches();
  recentDropdown.innerHTML = '';
  
  if (recent.length === 0) {
    recentDropdown.classList.add('hidden');
    return;
  }

  recent.forEach(cityName => {
    const li = document.createElement('li');
    li.textContent = cityName;
    li.addEventListener('click', () => {
      city.value = cityName;
      recentDropdown.classList.add('hidden');
      clearError();
      fetch_city(cityName);
    });
    recentDropdown.appendChild(li);
  });
  recentDropdown.classList.remove('hidden');
}

city.addEventListener('focus', () => {
  const recent = getRecentSearches();
  if (recent.length > 0) {
    renderDropdown();
  }
});

document.addEventListener('click', (e) => {
  if (e.target !== city && e.target !== recentDropdown && !recentDropdown.contains(e.target)) {
    recentDropdown.classList.add('hidden');
  }
});

function fetch_city(cityName) {
  const trimmedCity = cityName.trim();
  
  if (!validateCityInput(trimmedCity)) {
    return;
  }
  
  weather1.textContent = 'Loading...';
  
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(trimmedCity)}&appid=${apiKey}&units=metric`)
    .then(res => {
      if (res.status === 404) {
        throw new Error(`City "${trimmedCity}" not found. Please check the spelling.`);
      }
      if (res.status === 401) {
        throw new Error('API key is invalid. Please contact support.');
      }
      if (!res.ok) {
        throw new Error(`Error ${res.status}: Unable to fetch weather data.`);
      }
      return res.json();
    })
    .then(data => {
      addToRecentSearches(trimmedCity);
      lastForecastCoords = { lat: data.coord.lat, lon: data.coord.lon };
      if (!data || !data.main) {
        error_msg('No weather data received. Please try again.', 'error');
        return;
      }
      renderWeatherDisplay(data);
      fetch_5day_forecast(data.coord.lat, data.coord.lon);
      recentDropdown.classList.add('hidden');
      error_msg(`Weather for ${data.name} loaded successfully.`, 'success');
    })
    .catch(err => {
      error_msg(err.message || 'An unexpected error occurred. Please try again.', 'error');
      weather1.textContent = 'Unable to load weather. Please try a different city.';
    });
}

// fetching api and handling promise using .then. And showing data based on user current location
function fetch_city_curr_loc(lat, lon) {
  if (typeof lat !== 'number' || typeof lon !== 'number' || isNaN(lat) || isNaN(lon)) {
    error_msg('Invalid location coordinates. Please try again.', 'error');
    return;
  }
  
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    error_msg('Location coordinates are out of range.', 'error');
    return;
  }
  
  weather1.textContent = 'Loading...';
  
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
    .then(res => {
      if (!res.ok) {
        throw new Error('Unable to fetch weather for your location.');
      }
      return res.json();
    })
    .then(data => {
      addToRecentSearches(data.name);
      lastForecastCoords = { lat: data.coord.lat, lon: data.coord.lon };
      if (!data || !data.main) {
        error_msg('No weather data received. Please try again.', 'error');
        return;
      }
      renderWeatherDisplay(data);

      fetch_5day_forecast(data.coord.lat, data.coord.lon);
      error_msg(`Weather for ${data.name} loaded successfully.`, 'success');
    })
    .catch(err => {
      error_msg(err.message || 'Error fetching weather for your location.', 'error');
      weather1.textContent = 'Unable to load weather for your location.';
    });
}

search_button.addEventListener('click', () => fetch_city(city.value.trim()));

city.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') {
    fetch_city(city.value.trim());
  }
});

// getting users location 
location_btn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    error_msg('Geolocation is not supported by your browser.', 'error');
    return;
  }
  
  weather1.textContent = 'Detecting your location...';
  clearError();
  
  navigator.geolocation.getCurrentPosition(
    pos => {
      const { latitude, longitude } = pos.coords;
      fetch_city_curr_loc(latitude, longitude);
    },
    err => {
      let errorMessage = 'Unable to retrieve your location.';
      if (err.code === 1) {
        errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
      } else if (err.code === 2) {
        errorMessage = 'Location information is unavailable.';
      } else if (err.code === 3) {
        errorMessage = 'Location request timed out. Please try again.';
      }
      error_msg(errorMessage, 'error');
      weather1.textContent = 'Could not detect your location.';
    }
  );
});

renderDropdown();

tempToggle.addEventListener('click', () => {
  const currentUnit = getTempUnit();
  const newUnit = currentUnit === 'C' ? 'F' : 'C';
  setTempUnit(newUnit);
});

