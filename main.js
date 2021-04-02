const API_KEY = '007542c018f342fcd5ca67d906e197e7'
const API_URL = 'https://api.openweathermap.org/data/2.5/weather'

const main_city = document.getElementsByClassName('main_city_cont')[0]
const add_button = document.forms['search']
const fav_cities = document.getElementsByClassName('fav_cities')[0]

const myStorage = window.localStorage

function request(url) {
    return fetch(url).then(response => {
        return response.json();
    }).catch(exception => {
        console.warn(`Unable to fetch "${url}": ` + exception.message)
    });
}

function getWeatherByCoords(latitude, longitude) {
    const url = `${API_URL}?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
    return request(url);
}

function getWeatherByName(city) {
    const url = `${API_URL}?q=${city}&units=metric&appid=${API_KEY}`
    return request(url);
}

function loadCoordViaApi() {
    navigator.geolocation.getCurrentPosition(async function(position) {
        let weather = await getWeatherByCoords(position.coords.latitude, position.coords.longitude)
        updateCity(weather, main_city, 'main_city')
    },  async function(exception) {
        let weather = await getWeatherByName('Omsk')
        updateCity(weather, main_city, 'main_city')
        console.warn('No access to geolocation: ' + exception.message)
    });
}

async function loadLocal() {
    const copy = {};
    for (let key of Object.keys(myStorage)) {
        copy[key] = myStorage.getItem(key);
    }
    myStorage.clear();

    for (let key in copy) {
        let tmp = document.createElement('input')
        tmp.value = key
        await addCity(tmp);
    }
}


function updateCity (weather, city, class_reg) {
    let rec_city_name = weather['name']
    let rec_temp = weather['main']['temp_min']
    let rec_wind_speed = weather['wind']['speed']
    let rec_wind_direct = weather['wind']['deg']
    let rec_cloud = weather['weather'][0]['main']
    let rec_pressure = weather['main']['pressure']
    let rec_humidity = weather['main']['humidity']
    let rec_latitude = weather['coord']['lat']
    let rec_longitude = weather['coord']['lon']
    console.log(weather)

    city.getElementsByClassName(`${class_reg}_name`)[0].textContent = rec_city_name
    city.getElementsByClassName(`${class_reg}_temp`)[0].innerHTML = `${Math.round(rec_temp)}°C`
    city.getElementsByClassName('weather_icon')[0].src = `https://openweathermap.org/img/wn/${weather['weather'][0]['icon']}@4x.png`

    const weather_info = city.getElementsByClassName('city_info')[0];
    weather_info.getElementsByClassName('wind')[0].getElementsByClassName('weather_data_value')[0].textContent = `${rec_wind_speed} m/s, ${rec_wind_direct} deg`
    weather_info.getElementsByClassName('cloudiness')[0].getElementsByClassName('weather_data_value')[0].textContent = rec_cloud
    weather_info.getElementsByClassName('pressure')[0].getElementsByClassName('weather_data_value')[0].textContent = `${rec_pressure}hpa`
    weather_info.getElementsByClassName('humidity')[0].getElementsByClassName('weather_data_value')[0].textContent = `${rec_humidity}%`
    weather_info.getElementsByClassName('location')[0].getElementsByClassName('weather_data_value')[0].textContent = `[${rec_latitude}, ${rec_longitude}]`

    remLoader(city)
}

async function addCity(city) {
    const template = document.getElementById('fav_city_templ')
    const favCityEl = document.importNode(template.content.firstElementChild, true)
    favCityEl.id = `fav_${city.value}`
    fav_cities.appendChild(favCityEl)

    let weather = await getWeatherByName(city.value)

    if (weather == null) {
        alert('No ethernet connection!')
        deleteCity(city.value)
        return
    }
    if (weather['cod'] !== 200) {
        alert('Incorrect city name or some information missing')
        deleteCity(city.value)
        return
    }
    if (myStorage.getItem(weather['name']) !== null) {
        alert('Already added to the favourites')
        deleteCity(city.value)
        return
    }

    myStorage.setItem(weather['name'], city.value)

    updateCity(weather, favCityEl, 'fav_city')
}

function deleteCity(cityId) {
    const city = document.getElementById(`fav_${cityId}`);
    city.remove();
}

update_geo_button = document.getElementsByClassName('refresh_geopos')[0]

update_geo_button.addEventListener('click', function () {loadCoordViaApi()})

add_button.addEventListener('submit', function (event) {
    const city = document.getElementsByClassName('search_bar')[0]

    addCity(city)

    city.value = ''

    event.preventDefault()
})

fav_cities.addEventListener('click', function (event) {
    const cityId = event.target.closest('li').id.split('_')[1]
    const cityName = event.target.closest('li').getElementsByClassName('fav_city_main')[0].textContent

    deleteCity(cityId)
    myStorage.removeItem(cityId)
})

document.addEventListener('DOMContentLoaded', function () {
    loadCoordViaApi()
    loadLocal()
    initLoader()
})

function initLoader() {
    if (!main_city.classList.contains('loader')) {
        main_city.classList.add('loader');
    }
}

function remLoader(city) {
    city.classList.remove('loader');
}
