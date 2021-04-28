const API_KEY = '007542c018f342fcd5ca67d906e197e7'
const API_URL = 'https://api.openweathermap.org/data/2.5/weather'

const express = require('express');
const fetch = require('node-fetch')

const {Client} = require('pg');

const client = new Client({
    user: 'rnasibullin',
    host: 'localhost',
    database: 'weather_server',
    password: 'CottonMause22',
    port: 5432,
});
client.connect()

const app = express()

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', "*")
    res.header('Access-Control-Allow-Headers', "*")
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
    next()
});

app.get('/favourites', async function (req, res) {
    const query = `SELECT * FROM fav_cities;`
    client.query(query).then(
        data => {
            res.send(data)
        }
    ).catch(e => {
        console.log(e.message)
        res.statusCode = 404
    })
})

app.post('/favourites', async function (req, res) {
    let flag = await checkCity(req.query.q)

    if (flag) {
        const query = `INSERT INTO fav_cities (city) VALUES('${req.query.q}')`
        client.query(query).then(
            data => {
                res.send(data)
            }
        ).catch(e => {
            console.log(e.message)
            res.statusCode = 404
        })
    } else {
        res.statusCode = 404
        res.send()
    }
})

app.delete('/favourites', async function (req, res) {
    const query = `DELETE FROM fav_cities WHERE id in (SELECT id FROM fav_cities WHERE city = '${req.query.q}');`
    client.query(query).then(
        data => {
            res.send(data)
        }
    )
})

app.get('/weather/city', async function (req, res) {
    let url = `${API_URL}?q=${req.query.q}&units=metric&appid=${API_KEY}`
    fetch(url).then(
        response => {
            if (response.status === 200) {
                response.json().then(
                    data => res.json(data)
                )
            } else {
                res.statusCode = 404
                res.send()
            }
        }
    ).catch((e) => {
        console.log(e.message)
        res.statusCode = 404
        res.send()
    })
})

app.get('/weather/coordinates', async function (req, res) {
    let url = `${API_URL}?lat=${req.query.lat}&lon=${req.query.long}&units=metric&appid=${API_KEY}`
    fetch(url).then(
        response => {
            if (response.status === 200) {
                response.json().then(
                    data => res.json(data)
                )
            } else {
                res.statusCode = 404
                res.send()
            }
        }
    ).catch((e) => {
        console.log(e.message)
        res.statusCode = 404
        res.send()
    })
})

function checkCity(city) {
    return new Promise(function (resolve, reject) {
        const query_sel = `SELECT count(*) FROM fav_cities WHERE city = '${city}'`
        client.query(query_sel, (err, res) => {
            if (res['rows'][0]['count'] == 0) {
                resolve(true)
            }
            else {
                resolve(false)
            }
        })
    })
}

app.listen(13036);