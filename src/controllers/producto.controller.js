import { productoModelo } from "../models/producto.model";

export class productoController {
    static async crear(req, res) {
        try {
            const resultado = await productoModelo.crear();

            if(!resultado.success) {
                
            }
        } catch (error) {
            return res.status(500).json({ mensaje: "Error Interno del Servidr" });
        }
    }
}