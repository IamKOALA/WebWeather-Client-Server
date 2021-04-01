API_KEY = '007542c018f342fcd5ca67d906e197e7'
API_URL = 'https://api.openweathermap.org/data/2.5/weather'

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
    navigator.geolocation.getCurrentPosition(function(position) {
        updateCity(position.coords.latitude, position.coords.longitude);
    }, function(exception) {
        updateCity(0, 0);
        console.warn('No access to geolocation: ' + exception.message)
    });
}

main_city = document.getElementsByClassName('main_city_cont')[0]

async function updateCity (latitude, longitude) {
    let weather = await getWeatherByCoords(latitude, longitude)

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

    main_city.getElementsByClassName('main_city_name')[0].textContent = rec_city_name
    main_city.getElementsByClassName('main_city_temp')[0].innerHTML = `${Math.round(rec_temp)}°C`
    main_city.getElementsByClassName('weather_icon')[0].src = `https://openweathermap.org/img/wn/${weather['weather'][0]['icon']}@4x.png`

    const weather_info = main_city.getElementsByClassName('city_info')[0];
    weather_info.getElementsByClassName('wind')[0].getElementsByClassName('weather_data_value')[0].textContent = `${rec_wind_speed} m/s, ${rec_wind_direct} deg`
    weather_info.getElementsByClassName('cloudiness')[0].getElementsByClassName('weather_data_value')[0].textContent = rec_cloud
    weather_info.getElementsByClassName('pressure')[0].getElementsByClassName('weather_data_value')[0].textContent = `${rec_pressure}hpa`
    weather_info.getElementsByClassName('humidity')[0].getElementsByClassName('weather_data_value')[0].textContent = `${rec_humidity}%`
    weather_info.getElementsByClassName('location')[0].getElementsByClassName('weather_data_value')[0].textContent = `[${rec_latitude}, ${rec_longitude}]`
}

update_geo_button = document.getElementsByClassName('refresh_geopos')[0]

update_geo_button.addEventListener('click', function () {loadCoordViaApi()})