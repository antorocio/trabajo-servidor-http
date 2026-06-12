import { User } from "../models/UserModel.js";
import bcrypt, { hash } from 'bcryptjs'
import jwt from "jsonwebtoken"

const register = async (req, res) => {
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

}

const login = async (req, res) => {
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

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "1h"
        })

        res.json({
            success: true,
            data: token,
            message: "Token generado correctamente"
        })
    } catch (error) {
        res.status(500).json({ success: false, error: "Error al logguear" })
    }
}

export { register, login }