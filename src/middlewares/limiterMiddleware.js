import { rateLimit } from 'express-rate-limit'

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    handler: (req, res) => {
        return res.status(429).json({
            success: false,
            error: "Demasiadas solicitudes, por favor intente de nuevo más tarde"
        })
    }
})

export { limiter }