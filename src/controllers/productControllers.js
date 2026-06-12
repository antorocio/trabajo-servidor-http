import { Product } from "../models/ProductModel.js";

const getProducts = async (req, res) => {
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
}

const getProduct = async (req, res) => {
    try {
        const id = req.params.id
        const foundProduct = await Product.findById(id, { userId: 0})
        if (!foundProduct) return res.status(404).json({ success: false, error: "No existe un producto con ese ID" })
        res.json({
            success: true,
            data: foundProduct,
            message: "Producto obtenido correctamente"
        })
    } catch (error) {
        res.status(400).json({ success: false, error: "El formato del ID no es válido" })
    }
}

const createProduct = async (req, res) => {
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

        const product = newProduct.toObject()
        delete product.userId

        res.json({
            success: true,
            data: product,
            message: "Producto creado correctamente"
        })
    } catch (error) {
        res.status(500).json({ success: false, error: "Error al crear el producto" })
    }
}

const updateProduct = async (req, res) => {
    try {
        const id = req.params.id
        const body = req.body
        const updatedProduct = await Product.findByIdAndUpdate(id, { ...body, available: body.stock > 0 }, { new: true, projection: {userId : 0 } })

        if (!updatedProduct) return res.status(404).json({ success: false, error: "No existe un producto con ese ID" })

        res.json({
            success: true,
            data: updatedProduct,
            message: "Producto actualizado correctamente"
        })
    } catch (error) {
        res.status(400).json({ success: false, error: "El formato del ID no es válido" })
    }
}

const deleteProduct = async (req, res) => {
    try {
        const id = req.params.id

        const deletedProduct = await Product.findByIdAndDelete(id)
        if (!deletedProduct) return res.status(404).json({ success: false, error: "No existe un producto con ese ID" })
        const product = deletedProduct.toObject()
        delete product.userId

        res.json({
            success: true,
            data: product,
            message: "Producto eliminado correctamente"
        })
    } catch (error) {
        res.status(400).json({ success: false, error: "El formato del ID no es válido" })
    }
}

export { getProducts, getProduct, createProduct, updateProduct, deleteProduct }