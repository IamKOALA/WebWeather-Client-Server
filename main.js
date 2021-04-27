const main_city = document.getElementsByClassName('main_city_cont')[0]
const add_button = document.forms['search']
const fav_cities = document.getElementsByClassName('fav_cities')[0]

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
    return new Promise(function (resolve, reject) {
        let url = `http://localhost:13036/weather/city?q=${city}`;
        let request = new XMLHttpRequest();
        request.responseType = 'json'
        request.open('GET', url, true);
        request.send();
        request.onload = function () {
            if (request.status === 200) {
                console.log(request.response)
                resolve(request.response)
            } else {
                alert('Connection error')
            }
        }
        request.onerror = function () {
            alert('Connection error')
        }
    })
}

function loadCoordViaApi() {
    navigator.geolocation.getCurrentPosition(async function (position) {
        let weather = await getWeatherByCoords(position.coords.latitude, position.coords.longitude)
        updateCity(weather, main_city, 'main_city')
    }, async function (exception) {
        let weather = await getWeatherByName('Omsk')
        updateCity(weather, main_city, 'main_city')
        console.warn('No access to geolocation: ' + exception.message)
    });
}


function updateCity(weather, city, class_reg) {
    let rec_city_name = weather['name']
    let rec_temp = weather['main']['temp_min']
    let rec_wind_speed = weather['wind']['speed']
    let rec_wind_direct = weather['wind']['deg']
    let rec_cloud = weather['weather'][0]['main']
    let rec_pressure = weather['main']['pressure']
    let rec_humidity = weather['main']['humidity']
    let rec_latitude = weather['coord']['lat']
    let rec_longitude = weather['coord']['lon']

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
    const city_value = city.value
    const template = document.getElementById('fav_city_templ')
    const favCityEl = document.importNode(template.content.firstElementChild, true)
    favCityEl.id = `fav_${city.value}`
    if (document.getElementById(`${favCityEl.id}`) !== null) {
        alert('Already added to the favourites')
        return
    }
    fav_cities.appendChild(favCityEl)

    let weather = await getWeatherByName(city_value)

    if (weather == null) {
        alert('No ethernet connection!')
        remLoader(favCityEl)
        deleteCity(city_value)
        return
    }
    if (weather['cod'] !== 200) {
        alert('Incorrect city name or some information missing')
        remLoader(favCityEl)
        deleteCity(city_value)
        return
    }

    let correct_city_name = weather['name']
    let url = `http://localhost:13036/favourites?q=${correct_city_name}`;
    let request = new XMLHttpRequest();
    request.responseType = 'json'
    request.open('POST', url, true);
    request.send();
    request.onload = function () {
        if (request.status === 200) {
            console.log(request.response)
            remLoader(favCityEl)
            updateCity(weather, favCityEl, 'fav_city')
        } else {
            remLoader(favCityEl)
            deleteCity(city_value)
            alert('City already added')
        }
    }
    request.onerror = function () {
        remLoader(favCityEl)
        deleteCity(city_value)
        alert('Connection error')
    }

}

async function addCityNocheck(city) {
    const city_value = city
    const template = document.getElementById('fav_city_templ')
    const favCityEl = document.importNode(template.content.firstElementChild, true)
    favCityEl.id = `fav_${city.value}`
    fav_cities.appendChild(favCityEl)

    let weather = await getWeatherByName(city_value)

    if (weather == null) {
        alert('No ethernet connection!')
        remLoader(favCityEl)
        deleteCity(city_value)
        return
    }
    if (weather['cod'] !== 200) {
        alert('Incorrect city name or some information missing')
        remLoader(favCityEl)
        deleteCity(city_value)
        return
    }
    remLoader(favCityEl)
    updateCity(weather, favCityEl, 'fav_city')
}

function deleteCity(cityId) {
    const city = document.getElementById(`fav_${cityId}`);
    city.remove();
}

update_geo_button = document.getElementsByClassName('refresh_geopos')[0]

update_geo_button.addEventListener('click', function () {
    loadCoordViaApi()
})

add_button.addEventListener('submit', function (event) {
    const city = document.getElementsByClassName('search_bar')[0]

    addCity(city)

    city.value = ''

    event.preventDefault()
})

fav_cities.addEventListener('click', function (event) {
    const cityId = event.target.closest('li').id.split('_')[1]
    const cityName = event.target.closest('li').getElementsByClassName('fav_city_name')[0].textContent
    console.log(cityName)
    let url = `http://localhost:13036/favourites?q=${cityName}`;
    let request = new XMLHttpRequest();
    request.responseType = 'json'
    request.open('DELETE', url, true);
    request.send();
    request.onload = function () {
        if (request.status === 200) {
            console.log(request.response)
        } else {
            alert('Connection error')
        }
    }
    request.onerror = function () {
        alert('Connection error')
    }
    deleteCity(cityId)
})

document.addEventListener('DOMContentLoaded', function () {
    initLoader()
    loadCoordViaApi()
    let url = `http://localhost:13036/favourites`;
    let request = new XMLHttpRequest();
    request.responseType = 'json';
    request.open('GET', url);
    request.send();
    request.onload = function () {
        if (request.status === 200) {
            for (let i = 0; i < request.response['rows'].length; i++) {
                console.log(request.response['rows'][i]['city'])
                addCityNocheck(request.response['rows'][i]['city'])
            }
        } else {
            alert('Connection error')
        }
    }

    request.onerror = function () {
        alert('Connection error')
    }
})

function initLoader() {
    if (!main_city.classList.contains('loader')) {
        main_city.classList.add('loader');
    }
}

function remLoader(city) {
    city.classList.remove('loader');
}
