import express, { response } from 'express'

const products = [
    {
        id: 1,
        name: "Sahumerio de Lavanda",
        price: 1200,
        category: "Sahumerios",
        stock: 25,
        available: true
    },
    {
        id: 2,
        name: "Sahumerio de Sándalo",
        price: 1300,
        category: "Sahumerios",
        stock: 18,
        available: true
    },
    {
        id: 3,
        name: "Mazo Tarot Rider-Waite",
        price: 18500,
        category: "Tarot",
        stock: 8,
        available: true
    },
    {
        id: 4,
        name: "Mazo Tarot Marsella",
        price: 17200,
        category: "Tarot",
        stock: 0,
        available: false
    },
    {
        id: 5,
        name: "Vela Aromática de Canela",
        price: 2500,
        category: "Velas",
        stock: 20,
        available: true
    },
    {
        id: 6,
        name: "Vela Aromática de Vainilla",
        price: 2500,
        category: "Velas",
        stock: 15,
        available: true
    },
    {
        id: 7,
        name: "Péndulo de Cuarzo Rosa",
        price: 4800,
        category: "Minerales",
        stock: 10,
        available: true
    },
    {
        id: 8,
        name: "Amatista Natural",
        price: 3500,
        category: "Minerales",
        stock: 0,
        available: false
    },
    {
        id: 9,
        name: "Kit Limpieza Energética",
        price: 8900,
        category: "Kits",
        stock: 7,
        available: true
    },
    {
        id: 10,
        name: "Oráculo de los Ángeles",
        price: 21000,
        category: "Oráculos",
        stock: 4,
        available: true
    }
]

const server = express()

// Permiso para que las peticiones puedan enviar body JSON
server.use(express.json())

const PORT = 3001

// Base
server.get("/", (req, res) => {
    res.json({ message: "Bienvenid@" })
})

// Obtener los productos
server.get("/products", (req, res) => {
    res.json(products)
})

// Obtener un producto por su id
server.get("/products/:id", (req, res) => {
    const id = Number(req.params.id)
    const foundProduct = products.find(product => product.id === id)
    if (!foundProduct) return res.status(404).json({ error: "No existe un producto con ese ID" })
    res.json(foundProduct)
})

// Agregar un producto
server.post("/products", (req, res) => {
    const body = req.body
    const newProduct = {
        id: products.length + 1,
        ...body
    }
    products.push(newProduct)
    res.json(newProduct)
})

// Actualizar un producto
server.put("/products/:id", (req, res) => {
    const id = Number(req.params.id)
    const body = req.body
    const foundProduct = products.find(product => product.id === id)

    if (body.name) foundProduct.name = body.name
    if (body.price) foundProduct.price = body.price
    if (body.category) foundProduct.category = body.category
    if (body.stock) foundProduct.stock = body.stock
    if (body.available) foundProduct.available = body.available
    res.json(foundProduct)
})

// Eliminar un producto por su id
server.delete("/products/:id", (req, res) => {
    const id = Number(req.params.id)
    const index = products.findIndex(product => product.id === id)
    if (index === -1) {
        return res.status(404).json({ error: "No existe un producto con ese ID" })
    }
    products.splice(index, 1)
    res.json({ message: "Producto eliminado" })
})

server.listen(PORT, () => {
    console.log(`Servidor en escucha por el puerto http://localhost:${PORT}`)
})