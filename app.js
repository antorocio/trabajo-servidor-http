import express from 'express'
import bcrypt, { hash } from 'bcryptjs'
import { rateLimit } from 'express-rate-limit'
import jwt from 'jsonwebtoken'
import { connect, model, Schema } from 'mongoose'

// conexión a la base de datos
const connectDb = async () => {
    try {
        await connect("mongodb://localhost:27017/db_tp_servidor")
        console.log("Conectado a MongoDb")
    } catch (error) {
        console.log("Error al conectarse a MongoDb", error.message)
    }
}

// esquema y modelo de usuario
const userSchema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
}, {
    versionKey: false,
    timestamps: true
})

const User = model("User", userSchema)

// esquema y modelo de producto
const productSchema = new Schema({
    name: { type: String, required: true, unique: true },
    price: { type: Number, default: 0 },
    category: { type: String, default: "Sin categoria" },
    stock: { type: Number, default: 0 },
    available: { type: Boolean, default: false },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true }
}, {
    versionKey: false,
    timestamps: true
})

const Product = model("Product", productSchema)

// conexión con el servidor
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

const authMiddleware = (req, res, next) => {
    const header = req.headers.authorization

    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No autorizado" })
    }

    const token = header.split(" ")[1]

    try {
        const decoded = jwt.verify(token, "contraseñasegurayprivada")
        req.userLogged = decoded
        next()
    } catch (error) {
        return res.status(401).json({ error: error.message })
    }
}

// Base
server.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Bienvenid@"
    })
})

// obtener todos los productos del usuario logueado
server.get("/products", authMiddleware, async (req, res) => {
    try {
        const userLogged = req.userLogged
        const filterProducts = await Product.find({ userId: userLogged.id })
        res.json({
            success: true,
            data: filterProducts,
            message: "Productos obtenidos correctamente"
        })
    } catch (error) {
        res.status(500).json({ success: false, error: "Error al obtener los productos" })
    }
})

// obtener un producto por su id
server.get("/products/:id", authMiddleware, async (req, res) => {
    try {
        const id = req.params.id
        const foundProduct = await Product.findById(id)
        if (!foundProduct) return res.status(404).json({ success: false, error: "No existe un producto con ese ID" })
        res.json({
            success: true,
            data: foundProduct,
            message: "Producto obtenido correctamente"
        })
    } catch (error) {
        res.status(400).json({ success: false, error: "El formato del ID no es válido" })
    }
})

// crear un producto
server.post("/products", authMiddleware, async (req, res) => {
    try {
        const body = req.body
        const userLogged = req.userLogged

        const newProduct = await Product.create({
            name: body.name,
            price: body.price,
            category: body.category,
            stock: body.stock,
            available: body.stock > 0,
            userId: userLogged.id
        })

        newProduct.save()

        const publicDataProduct = {
            id: newProduct._id,
            name: newProduct.name,
            price: newProduct.price,
            category: newProduct.category,
            stock: newProduct.stock,
            available: newProduct.available,
            createdAt: newProduct.createdAt,
            updatedAt: newProduct.updatedAt
        }

        res.json({
            success: true,
            data: publicDataProduct,
            message: "Producto creado correctamente"
        })
    } catch (error) {
        res.status(500).json({ success: false, error: "Error al crear el producto" })
    }
})

// actualizar producto por id
server.put("/products/:id", authMiddleware, async (req, res) => {
    try {
        const id = req.params.id
        const body = req.body
        const updatedProduct = await Product.findByIdAndUpdate(id, { ...body, available: body.stock > 0 }, { new: true })

        if (!updatedProduct) return res.status(404).json({ success: false, error: "No existe un producto con ese ID" })

        res.json({
            success: true,
            data: updatedProduct,
            message: "Producto actualizado correctamente"
        })
    } catch (error) {
        res.status(400).json({ success: false, error: "El formato del ID no es válido" })
    }
})

// eliminar producto por id
server.delete("/products/:id", authMiddleware, async (req, res) => {
    try {
        const id = req.params.id

        const deletedProduct = await Product.findByIdAndDelete(id)
        if (!deletedProduct) return res.status(404).json({ success: false, error: "No existe un producto con ese ID" })

        res.json({
            success: true,
            data: deletedProduct,
            message: "Producto eliminado correctamente"
        })
    } catch (error) {
        res.status(400).json({ success: false, error: "El formato del ID no es válido" })
    }
})

// registro
server.post("/auth/register", async (req, res) => {
    try {

        const body = req.body

        const { username, email, password } = body

        const foundUser = await User.findOne({ email })

        if (foundUser) { return res.status(409).json({ success: false, error: "El usuario ya existe" }) }

        const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-]).{8,}$/

        if (!regex.test(password)) {
            return res.status(400).json({ success: false, error: "Contraseña inválida. Debe contener al menos 8 caracteres, una letra mayúscula, un número y un carácter especial." })
        }

        const hashPassword = await bcrypt.hash(password, 10)

        const newUser = await User.create({
            username,
            email,
            password: hashPassword,
        })

        newUser.save()

        const publicDataUser = {
            id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            createdAt: newUser.createdAt,
            updatedAt: newUser.updatedAt
        }

        res.json({
            success: true,
            data: publicDataUser,
            message: "Usuario registrado correctamente"
        })
    } catch (error) {
        res.status(500).json({ success: false, error: "Error al registrar el usuario" })
    }

})

// login
server.post("/auth/login", limiter, async (req, res) => {
try {
        const body = req.body
    const { email, password } = body

    if (!email || !password) {
        return res.status(401).json({ success: false, error: "No autorizado" })
    }

    const foundUser = await User.findOne({ email })

    if (!foundUser) { return res.status(401).json({ success: false, error: "No autorizado" }) }

    const isValid = await bcrypt.compare(password, foundUser.password)

    if (!isValid) { return res.status(401).json({ success: false, error: "No autorizado" }) }

    const payload = { id: foundUser._id, username: foundUser.username, email: foundUser.email }
    const secretKey = "contraseñasegurayprivada"

    const token = jwt.sign(payload, secretKey, { expiresIn: "1h" })

    res.json({
        success: true,
        data: token,
        message: "Token generado correctamente"
    })
} catch (error) {
    res.status(500).json({ success: false, error: "Error al logguear" })
}
})

server.listen(PORT, () => {
    connectDb()
    console.log(`Servidor en escucha por el puerto http://localhost:${PORT}`)
})