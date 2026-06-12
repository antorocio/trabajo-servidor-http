import { connect } from "mongoose"

const connectDb = async () => {
    try {
        await connect("mongodb://localhost:27017/db_tp_servidor")
        console.log("Conectado a MongoDb")
    } catch (error) {
        console.log("Error al conectarse a MongoDb", error.message)
    }
}

export { connectDb }