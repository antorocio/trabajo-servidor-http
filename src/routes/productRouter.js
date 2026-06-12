import { Router } from "express";
import { createProduct, deleteProduct, getProduct, getProducts, updateProduct } from "../controllers/productControllers.js";

const ProductRouter = Router()

ProductRouter.get("/", getProducts)
ProductRouter.get("/:id", getProduct)
ProductRouter.post("/", createProduct)
ProductRouter.put("/:id", updateProduct)
ProductRouter.delete("/:id", deleteProduct)

export { ProductRouter }