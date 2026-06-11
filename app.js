import express from 'express'
import bcrypt from 'bcryptjs'
import { rateLimit } from 'express-rate-limit'
import jwt from 'jsonwebtoken'

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

const users = []

const server = express()
server.use(express.json())
const PORT = 3001

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    limit: 5,
    handler: (req, res) => {
        return res.status(429).json({
            error: "Demasiadas solicitudes, por favor intente de nuevo más tarde"
        })
    }
})

server.get("/", (req, res) => {
    res.json({ message: "Bienvenid@" })
})

server.get("/products", (req, res) => {
    res.json(products)
})

server.get("/products/:id", (req, res) => {
    const id = Number(req.params.id)
    const foundProduct = products.find(product => product.id === id)
    if (!foundProduct) return res.status(404).json({ error: "No existe un producto con ese ID" })
    res.json(foundProduct)
})

server.post("/products", (req, res) => {
    const body = req.body
    const newProduct = {
        id: products.length + 1,
        ...body
    }
    products.push(newProduct)
    res.json(newProduct)
})

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

server.delete("/products/:id", (req, res) => {
    const id = Number(req.params.id)
    const index = products.findIndex(product => product.id === id)
    if (index === -1) {
        return res.status(404).json({ error: "No existe un producto con ese ID" })
    }
    products.splice(index, 1)
    res.json({ message: "Producto eliminado" })
})

server.post("/auth/register", async (req, res) => {
    const body = req.body
    const id = users.length + 1
    const { username, email, password } = body
    const foundUser = users.find(user => user.email === email)
    if (foundUser) {
        return res.status(409).json({ error: "El usuario ya existe" })
    }
    const hashPassword = await bcrypt.hash(password, 10)
    const newUser = {
        id,
        username,
        email,
        password: hashPassword
    }
    users.push(newUser)
    const { password: passwordNewUser, ...data } = newUser
    res.json(data)
})

server.post("/auth/login", limiter, async (req, res) => {
    const body = req.body
    const { email, password } = body
    if (!email || !password) {
        return res.status(401).json({ error: "No autorizado" })
    }
    const foundUser = users.find(user => user.email === email)
    if (!foundUser) {
        return res.status(401).json({ error: "No autorizado" })
    }
    const isValid = await bcrypt.compare(password, foundUser.password)
    if (!isValid) {
        return res.status(401).json({ error: "No autorizado" })
    }

    const payload = { id: foundUser.id, username: foundUser.username, email: foundUser.email }
    const secretKey = "contraseñasegurayprivada"
    const token = jwt.sign(payload, secretKey, { expiresIn: "1m" })

    res.json({ token })

    //res.status(202).json({ status: "Logueado con éxito" })
})

server.listen(PORT, () => {
    console.log(`Servidor en escucha por el puerto http://localhost:${PORT}`)
})