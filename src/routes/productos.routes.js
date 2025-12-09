import { Router } from "express";
import { productoController } from "../controllers/producto.controller.js";

export const productoRouter = Router();

productoRouter.post('/', productoController.crear);