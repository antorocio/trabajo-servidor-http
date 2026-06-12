import express from 'express'
import { connectDb } from './config/mongoDb.js'
import { ProductRouter } from './routes/productRouter.js'
import { AuthRouter } from './routes/authRouter.js'
import { authMiddleware } from './middlewares/authMiddleware.js'

// conexión con el servidor
const server = express()
server.use(express.json())
const PORT = 3001

// Base
server.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Bienvenid@"
    })
})

server.use("/products", authMiddleware, ProductRouter)
server.use("/auth", AuthRouter )

server.listen(PORT, () => {
    connectDb()
    console.log(`Servidor en escucha por el puerto http://localhost:${PORT}`)
})

export { server }
