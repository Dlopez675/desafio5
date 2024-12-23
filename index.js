const express = require('express')
const app = express()
const fs = require('fs');


// Middleware para generar informes de actividad
app.use((req, res, next) => {
    const log = {
        method: req.method,
        url: req.originalUrl,
        timestamp: new Date().toISOString(),
    };

    // Imprimir log en la consola
    console.log(log);

    // Guardar el log en un archivo
    fs.appendFileSync('logs.txt', JSON.stringify(log) + '\n');

    next(); // Pasar al siguiente middleware o ruta
});


app.listen(3000, console.log('Server ON'))
const { obtenerJoyas, obtenerJoyasFiltros, contarJoyas, contarStockTotal } = require('./consultas')


app.get('/joyas', async (req, res) => {
    try {
        let result = await obtenerJoyas(req.query)
        let cantidadJoyas = await contarJoyas()
        let stockTotal = await contarStockTotal()
        let response = {
            "totalJoyas": cantidadJoyas,
            "stockTotal": stockTotal,
            "result": result,
        }
        res.json(response)
    } catch (error) {
        res.status(404).send(error.message)
    }
});

app.get("/joyas/filtros", async (req, res) => {
    try {
        const queryString = req.query
        const joyasFiltros = await obtenerJoyasFiltros(queryString)
        res.json(joyasFiltros)
    } catch (error) {

    }
});