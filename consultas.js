const { Pool } = require("pg");
require('dotenv').config();

const format = require('pg-format');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    allowExitOnIdle: true
});


const obtenerJoyas = async ({ limit = 3, order_by = "stock_ASC", page = 1 }) => {
    try {
        const [campo, direccion] = order_by.split("_")
        const offset = Math.abs((page - 1) * limit)
        let consulta = format("SELECT * FROM inventario order by %s %s LIMIT %s OFFSET %s", campo, direccion, limit, offset);
        const { rows: inventario } = await pool.query(consulta);
        return inventario;
    } catch (error) {
        throw new Error("No se pudo obtener los inventarios")
    }
}

const contarJoyas = async () => {
    try {
        let consulta = "SELECT * FROM inventario";
        const { rows: inventario } = await pool.query(consulta);
        return inventario.length;
    } catch (error) {
        throw new Error("No se pudo obtener Total de Joyas");
    }
    
}

const contarStockTotal = async () => {
    try {
        const consulta = "SELECT SUM(stock) AS stock_total FROM inventario";
        const { rows: [result] } = await pool.query(consulta);
        return parseInt(result.stock_total, 10); // Aseguramos que el valor sea un número entero
    } catch (error) {
        throw new Error("No se pudo obtener el stock total");
    }
};


const obtenerJoyasFiltros = async ({ precio_max, precio_min, categoria, metal }) => {
    try {
        let filtros = []
        let values = []

        const agregarFiltro = (campo, comparador, valor) => {
            values.push(valor)
            filtros.push(`${campo} ${comparador} $${filtros.length + 1}`)
        }

        if (precio_max) {
            agregarFiltro("precio", "<=", precio_max)
        }

        if (precio_min) {
            agregarFiltro("precio", ">=", precio_min)
        }

        if (categoria) {
            agregarFiltro("categoria", "=", categoria)
        }

        if (metal) {
            agregarFiltro("metal", "=", metal)
        }

        let consulta = "SELECT * FROM inventario";
        if (filtros.length > 0) {
            consulta += ` WHERE ${filtros.join(" AND ")}`
        }

        let result = await pool.query(consulta, values)
        return result.rows
    } catch (error) {
        throw new Error(error.massage)
    }
}

module.exports = { obtenerJoyas, obtenerJoyasFiltros, contarJoyas, contarStockTotal };