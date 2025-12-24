// assigning values
const api_key = "04239c8b1471c42691b30039b23029fa";
const city = document.getElementById('city');
const search_button = document.getElementById('search_button');
const location_btn = document.getElementById('location');
const weather1 = document.getElementById('weather1');
const error_box = document.getElementById('error_box');
const alert_box = document.getElementById('alert_box');
const recent_dropd = document.getElementById('recent_dropd');
const temp_togg = document.getElementById('temp_togg');
const forecast_container = document.getElementById('forecast_container');
const recent_search = 'recentSearchedCities';
const temp_unit_key = 'temperatureUnit';
const max = 15;
//functions to get,set,and convert temperature 
function get_temp_unit() {
  return localStorage.getItem(temp_unit_key) || 'C';
}

function set_temp_unit(unit) {
  localStorage.setItem(temp_unit_key, unit);
  temp_togg.textContent = unit === 'C' ? '°C / °F' : '°F / °C';
  if (weather1.innerHTML && weather1.innerHTML !== 'Search a city or use your current location.') {
    render_weather_display(last_weather_data);
  }
}

function celsius_to_fahrenheit(celsius) {
  return Math.round((celsius * 9/5 + 32) * 10) / 10;
}
// funtion to display weather icon according to weather 
function get_weather_emoji(description, main) {
  const desc = (description || '').toLowerCase();
  const main_type = (main || '').toLowerCase();

  if (main_type.includes('clear') || main_type.includes('sunny')) return '☀️';
  if (main_type.includes('cloud')) return '☁️';
  if (main_type.includes('rain') || main_type.includes('drizzle')) return '🌧️';
  if (main_type.includes('thunderstorm')) return '⛈️';
  if (main_type.includes('snow')) return '❄️';
  if (main_type.includes('mist') || main_type.includes('fog')) return '🌫️';
  if (main_type.includes('wind')) return '💨';

  return '🌤️';
}

function check_temperature_alert(temp) {
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

function display_alert(temp) {
  const alert = check_temperature_alert(temp);
  if (alert.show) {
    alert_box.textContent = alert.message;
    alert_box.classList.remove('hidden');
  } else {
    alert_box.classList.add('hidden');
  }
}

let last_weather_data = null;
//fetching api and handling it using .then for next 5 day forecast 
function fetch_5day_forecast(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${api_key}&units=metric`)
    .then(res => {
      if (!res.ok) throw new Error('Unable to fetch forecast data');
      return res.json();
    })
    .then(data => {
      display_5day_forecast(data);
    })
    .catch(err => {
      forecast_container.innerHTML = '<p class="text-gray-600">Unable to load 5-day forecast</p>';
      error_msg('Unable to load 5-day forecast. Please try again later.', 'error');
    });
}

function display_5day_forecast(data) {
  if (!data || !data.list) {
    forecast_container.innerHTML = '<p class="text-gray-600">No forecast data available</p>';
    return;
  }

  const daily_forecasts = {};

  data.list.forEach(item => {
    const date = new Date(item.dt * 1000);
    const day = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    if (!daily_forecasts[day] || date.getHours() === 12) {
      daily_forecasts[day] = item;
    }
  });

  const forecast_array = Object.entries(daily_forecasts).slice(0, 5);

  forecast_container.innerHTML = '';

  if (forecast_array.length === 0) {
    forecast_container.innerHTML = '<p class="text-gray-600">No forecast data available</p>';
    return;
  }

  forecast_array.forEach(([day, forecast]) => {
    let temp = Math.round(forecast.main.temp * 10) / 10;

    const humidity = forecast.main.humidity;
    const wind_speed = Math.round(forecast.wind.speed * 10) / 10;
    const description = forecast.weather[0] ? forecast.weather[0].description : 'No description';
    const main_type = forecast.weather[0] ? forecast.weather[0].main : '';
    const weather_emoji = get_weather_emoji(description, main_type);

    const card = document.createElement('div');
    card.className = 'forecast-card';
    card.innerHTML = `
      <div class="forecast-date">${day}</div>
      <div class="forecast-condition">${weather_emoji} ${description.charAt(0).toUpperCase() + description.slice(1)}</div>
      
      <div class="forecast-weather">
        <div class="forecast-item">
          <div class="forecast-icon">🌡️</div>
          <div class="forecast-label">Temp</div>
          <div class="forecast-value">${temp}°C</div>
        </div>
        
        <div class="forecast-item">
          <div class="forecast-icon">💨</div>
          <div class="forecast-label">Wind</div>
          <div class="forecast-value">${wind_speed} m/s</div>
        </div>
        
        <div class="forecast-item">
          <div class="forecast-icon">💧</div>
          <div class="forecast-label">Humidity</div>
          <div class="forecast-value">${humidity}%</div>
        </div>
      </div>
    `;

    forecast_container.appendChild(card);
  });
}

function render_weather_display(data) {
  last_weather_data = data;

  const temp_unit = get_temp_unit();
  const name = data.name || 'Unknown';
  const country = data.sys && data.sys.country ? `, ${data.sys.country}` : '';

  let temp = Math.round(data.main.temp * 10) / 10;
  let feels_like = Math.round(data.main.feels_like * 10) / 10;

  if (temp_unit === 'F') {
    temp = celsius_to_fahrenheit(temp);
    feels_like = celsius_to_fahrenheit(feels_like);
  }

  const humidity = data.main.humidity;
  const desc = data.weather && data.weather[0] ? data.weather[0].description : 'No description';
  const main_type = data.weather && data.weather[0] ? data.weather[0].main : '';
  const wind_speed = data.wind && data.wind.speed ? Math.round(data.wind.speed * 10) / 10 : 'N/A';

  if (name && name !== 'Unknown') city.value = name;

  const emoji = get_weather_emoji(desc, main_type);

  display_alert(data.main.temp);
  // displaying data on the page using innerhtml
  weather1.innerHTML = `
    <div class="city-name">${emoji} ${name}${country}</div>
    <div class="condition">${desc.charAt(0).toUpperCase() + desc.slice(1)}</div>
    
    <div class="weather-grid">
      <div class="weather-item">
        <div class="label">Temperature</div>
        <div class="value">${temp}°${temp_unit}</div>
      </div>
      
      <div class="weather-item">
        <div class="label">Feels Like</div>
        <div class="value">${feels_like}°${temp_unit}</div>
      </div>
      
      <div class="weather-item">
        <div class="label">Humidity</div>
        <div class="value">${humidity}%</div>
      </div>
      
      <div class="weather-item">
        <div class="label">Wind Speed</div>
        <div class="value">${wind_speed} m/s</div>
      </div>
  `;
  clear_error();
}
//custom pop-up
function show_popup(message, type = 'error', timeout = 5000) {
  const existing = document.getElementById('custom-popup');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'custom-popup';
  overlay.style.position = 'fixed';
  overlay.style.left = '0';
  overlay.style.top = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = '9999';
  overlay.style.pointerEvents = 'auto';

  const box = document.createElement('div');
  box.style.maxWidth = '90%';
  box.style.width = '420px';
  box.style.background = type === 'error' ? '#fee2e2' : '#dcfce7';
  box.style.border = '1px solid ' + (type === 'error' ? '#ef4444' : '#22c55e');
  box.style.color = type === 'error' ? '#7f1d1d' : '#166534';
  box.style.padding = '16px 18px';
  box.style.borderRadius = '10px';
  box.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
  box.style.fontSize = '14px';
  box.style.lineHeight = '1.4';

  const msg = document.createElement('div');
  msg.textContent = message;

  const close = document.createElement('button');
  close.textContent = 'Close';
  close.style.marginTop = '12px';
  close.style.padding = '6px 10px';
  close.style.border = 'none';
  close.style.borderRadius = '6px';
  close.style.cursor = 'pointer';
  close.style.background = type === 'error' ? '#ef4444' : '#22c55e';
  close.style.color = '#fff';

  close.addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });

  box.appendChild(msg);
  box.appendChild(close);
  overlay.appendChild(box);
  document.body.appendChild(overlay);

  if (timeout > 0) {
    setTimeout(() => { if (overlay.parentNode) overlay.remove(); }, timeout);
  }
}

function error_msg(msg, type = 'error') {
  if (!msg || msg.trim() === '') return;
  error_box.textContent = msg;
  error_box.className = type;
  error_box.classList.remove('hidden');

  show_popup(msg, type, type === 'error' ? 7000 : 4000);

  if (type === 'success') {
    setTimeout(() => {
      error_box.classList.add('hidden');
    }, 4000);
  }
}

function clear_error() {
  error_box.classList.add('hidden');
  error_box.textContent = '';
}

function validate_city_input(city_name) {
  const trimmed = city_name.trim();

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

  const valid_city_pattern = /^[a-zA-Z\s\-']+$/;
  if (!valid_city_pattern.test(trimmed)) {
    error_msg('City name contains invalid characters. Use only letters, spaces, hyphens, and apostrophes.', 'warning');
    return false;
  }

  return true;
}

function get_recent_searches() {
  const stored = localStorage.getItem(recent_search);
  return stored ? JSON.parse(stored) : [];
}
// addding recent search dropdown bar
function add_to_recent_searches(city_name) {
  let recent = get_recent_searches();
  recent = recent.filter(c => c.toLowerCase() !== city_name.toLowerCase());
  recent.unshift(city_name);
  recent = recent.slice(0, max);
  localStorage.setItem(recent_search, JSON.stringify(recent));
  render_dropdown();
}

function render_dropdown() {
  const recent = get_recent_searches();
  recent_dropd.innerHTML = '';

  if (recent.length === 0) {
    recent_dropd.classList.add('hidden');
    return;
  }

  recent.forEach(city_name => {
    const li = document.createElement('li');
    li.textContent = city_name;
    li.addEventListener('click', () => {
      city.value = city_name;
      recent_dropd.classList.add('hidden');
      clear_error();
      fetch_city(city_name);
    });
    recent_dropd.appendChild(li);
  });
  recent_dropd.classList.remove('hidden');
}

city.addEventListener('focus', () => {
  const recent = get_recent_searches();
  if (recent.length > 0) {
    render_dropdown();
  }
});

document.addEventListener('click', (e) => {
  if (e.target !== city && e.target !== recent_dropd && !recent_dropd.contains(e.target)) {
    recent_dropd.classList.add('hidden');
  }
});

function fetch_city(city_name) {
  const trimmed_city = city_name.trim();

  if (!validate_city_input(trimmed_city)) {
    return;
  }

  weather1.textContent = 'Loading...';
// fetching api and handling promise using .then. And showing data based on users entered city name
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(trimmed_city)}&appid=${api_key}&units=metric`)
    .then(res => {
      if (res.status === 404) {
        throw new Error(`City "${trimmed_city}" not found. Please check the spelling.`);
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
      add_to_recent_searches(trimmed_city);
      if (!data || !data.main) {
        error_msg('No weather data received. Please try again.', 'error');
        return;
      }
      render_weather_display(data);
      fetch_5day_forecast(data.coord.lat, data.coord.lon);
      recent_dropd.classList.add('hidden');
      error_msg(`Weather for ${data.name} loaded successfully.`, 'success');
    })
    .catch(err => {
      let message = 'An unexpected error occurred. Please try again.';
      try {
        if (err instanceof TypeError || /failed to fetch/i.test(err.message || '')) {
          message = 'Network error: please check your internet connection and try again.';
        } else if (err && err.message) {
          message = err.message;
        }
      } catch (e) {
        message = err.message || message;
      }
      error_msg(message, 'error');
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

  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_key}&units=metric`)
    .then(res => {
      if (!res.ok) {
        throw new Error('Unable to fetch weather for your location.');
      }
      return res.json();
    })
    .then(data => {
      add_to_recent_searches(data.name);
      if (!data || !data.main) {
        error_msg('No weather data received. Please try again.', 'error');
        return;
      }
      render_weather_display(data);

      fetch_5day_forecast(data.coord.lat, data.coord.lon);
      error_msg(`Weather for ${data.name} loaded successfully.`, 'success');
    })
    .catch(err => {
      let message = 'Error fetching weather for your location.';
      if (err instanceof TypeError || /failed to fetch/i.test(err.message || '')) {
        message = 'Network error: please check your internet connection and try again.';
      } else if (err && err.message) {
        message = err.message;
      }
      error_msg(message, 'error');
      weather1.textContent = 'Unable to load weather for your location.';
    });
}

search_button.addEventListener('click', () => fetch_city(city.value.trim()));

city.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') {
    fetch_city(city.value.trim());
  }
});
 
// getting users location and hadling errors 
location_btn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    error_msg('Geolocation is not supported by your browser.', 'error');
    return;
  }

  weather1.textContent = 'Detecting your location...';
  clear_error();

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

render_dropdown();
//changing from celsius to fharenhit onclick of the button 
temp_togg.addEventListener('click', () => {
  const current_unit = get_temp_unit();
  const new_unit = current_unit === 'C' ? 'F' : 'C';
  set_temp_unit(new_unit);
});

