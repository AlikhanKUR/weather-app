const apiKey = '718bcbef6fb5dfa287aaf9ae76f483c4'; // Замените на свой ключ API OpenWeatherMap
const city = 'Костанай'; // Замените на название вашего города

const temperatureUnit = '˚';
const humidityUnit = ' %';
const pressureUnit = ' мм. рт. ст.';
const windUnit = ' м/с';

const weatherDescriptions = {
  'Clear': 'Ясно',
  'Clouds': 'Облачно',
  'Rain': 'Дождь',
  'Snow': 'Снег',
  'Thunderstorm': 'Гроза',
  'Drizzle': 'Мелкий дождь',
  'Mist': 'Туман',
  'Fog': 'Туман',
  'Haze': 'Мгла',
  'Dust': 'Пыль',
  'Sand': 'Песок',
  'Ash': 'Пепел',
  'Tornado': 'Торнадо',
};

var currentData;

async function getData() {
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
  
  try {
    let response = await fetch(apiUrl);

    if (response.ok) {
      let jsonData = await response.json();
      return jsonData;
    } else {
      alert('Error: ' + response.status);
    }
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

function convertPressure(value) {
  return (value / 1.33).toFixed();
}

Number.prototype.pad = function (size) {
  var s = String(this);
  while (s.length < (size || 2)) {
    s = '0' + s;
  }
  return s;
};

function getHoursString(dateTime) {
  let date = new Date(dateTime);
  let hours = date.getHours().pad();

  return hours;
}

function getValueWithUnit(value, unit) {
  return `${value}${unit}`;
}

function kelvinToCelsius(value) {
  return value - 273.15;
}

function getTemperature(value) {
  var roundedValue = kelvinToCelsius(value).toFixed();
  return getValueWithUnit(roundedValue, temperatureUnit);
}

function render(data) {
  renderCity(data);
  renderCurrentTemperature(data);
  renderCurrentDescription(data);

  renderForecast(data);
  renderDetails(data);
  renderDayOrNight(data);
}

function renderCity(data) {
  let cityName = document.querySelector('.current__city');
  cityName.innerHTML = data.name;
}

function renderCurrentTemperature(data) {
  let tmp = data.main.temp;

  let currentTmp = document.querySelector('.current__temperature');
  currentTmp.innerHTML = getTemperature(tmp);
}

function renderCurrentDescription(data) {
  let englishDescription = data.weather[0].main;
  let russianDescription = weatherDescriptions[englishDescription] || englishDescription;

  let description = document.querySelector('.current__description');
  description.innerHTML = russianDescription;
}

function renderForecast(data) {
  let forecastDataContainer = document.querySelector('.forecast');
  let forecasts = '';

  for (let i = 0; i < 6; i++) {
    let item = data;

    let icon = item.weather[0].icon;
    let temp = getTemperature(item.main.temp);
    let hours = i === 0 ? 'Сейчас' : getHoursString(item.dt * 1000);

    let template = `<div class="forecast__item">
      <div class="forecast__time">${hours}</div>
      <div class="forecast__icon icon__${icon}"></div>
      <div class="forecast__temperature">${temp}</div>
    </div>`;
    forecasts += template;
  }
  forecastDataContainer.innerHTML = forecasts;
}

function renderDetails(data) {
  let pressureValue = convertPressure(data.main.pressure);
  let pressure = getValueWithUnit(pressureValue, pressureUnit);
  let humidity = getValueWithUnit(data.main.humidity, humidityUnit);
  let feels_like = getTemperature(data.main.feels_like);
  let wind = getValueWithUnit(data.wind.speed, windUnit);

  renderDetailsItem('feelslike', feels_like);
  renderDetailsItem('humidity', humidity);
  renderDetailsItem('pressure', pressure);
  renderDetailsItem('wind', wind);
}

function renderDetailsItem(className, value) {
  let container = document.querySelector(`.${className}`).querySelector('.details__value');
  container.innerHTML = value;
}

function isDay(data) {
  let sunrise = data.sys.sunrise * 1000;
  let sunset = data.sys.sunset * 1000;

  let now = Date.now();
  return now > sunrise && now < sunset;
}

function renderDayOrNight(data) {
  let attrName = isDay(data) ? 'day' : 'night';
  transition();
  document.documentElement.setAttribute('data-theme', attrName);
}

function periodicTasks() {
  setInterval(start, 6000000);
  setInterval(function () {
    renderDayOrNight(currentData);
  }, 60000);
}

function start() {
  getData().then(data => {
    currentData = data;
    render(data);
    periodicTasks();
  });
}

function transition() {
  document.documentElement.classList.add('transition');
  setTimeout(function () {
    document.documentElement.classList.remove('transition');
  }, 4000);
}

start();