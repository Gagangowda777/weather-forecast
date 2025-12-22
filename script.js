// assigning values
const apiKey = "04239c8b1471c42691b30039b23029fa";
const city = document.getElementById('city');
const search_button = document.getElementById('search_button');
const location = document.getElementById('location');
const weather1 = document.getElementById('weather1');

function error_msg(msg) {
  weather1.textContent = msg;
}

//displaying weather information  
function Weather_info(data) {
  if (!data || !data.main) {
    error_msg('No data received');
    return;
  }
  const name = data.name || '';
  const temp = data.main.temp;
  const desc = data.weather && data.weather[0] ? data.weather[0].description : '';

  if (name) city.value = name;

  weather1.textContent = `${name} — ${temp}°C — ${desc}`;
}

// fetching api and handling promise using .then. And showing data based on user entered city name
function fetch_city(cityName) {
  if (!cityName) {
    error_msg('Please enter a city name');
    return;
  }
  weather1.textContent = 'Loading...';
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&appid=${apiKey}&units=metric`)
    .then(res => {
      if (!res.ok) throw new Error('City not found');
      return res.json();
    })
    .then(data => Weather_info(data))
    .catch(err => error_msg(err.message || 'Error fetching weather'));
}

// fetching api and handling promise using .then. And showing data based on user current location
function fetch_city_curr_loc(lat, lon) {
  weather1.textContent = 'Loading...';
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
    .then(res => {
      if (!res.ok) throw new Error('Location not found');
      return res.json();
    })
    .then(data => Weather_info(data))
    .catch(err => error_msg(err.message || 'Error fetching weather'));
}

search_button.addEventListener('click', () => fetch_city(city.value.trim()));

city.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') fetch_city(city.value.trim());
});

// getting users location 
location.addEventListener('click', () => {
  if (!navigator.geolocation) {
    error_msg('Geolocation not supported in this browser');
    return;
  }
  weather1.textContent = 'Detecting location...';
  navigator.geolocation.getCurrentPosition(
    pos => {
      const { latitude, longitude } = pos.coords;
      fetch_city_curr_loc(latitude, longitude);
    },
    err => error_msg('Unable to retrieve location')
  );
});

