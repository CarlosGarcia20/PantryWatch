import { prologService } from "../services/prologService.js";

export class sensorController {
    static async recibirDatosSensor(req, res) {
        try {
            const { zona, temperatura, humedad, peso_actual } = req.body;

            if (!zona || temperatura === undefined || humedad === undefined) {
                return res.status(400).json({ error: "Faltan datos" });
            }

            console.log(`📥 API: Recibido de ${zona} -> T:${temperatura} H:${humedad}`);

            // 1. Llamada al servicio
            const resultado = await prologService.procesarDatosSensor(zona, temperatura, humedad);
            
            if (resultado.alertas.length > 0) {
                console.log(`   🚨 ESTADO CRÍTICO: ${resultado.estado}`);
                
                return res.status(200).json({ 
                    status: resultado.estado,  // "AGOTADO" o "PELIGRO"
                    data: resultado.alertas    // Lista de productos afectados
                });
            }

            // 3. Todo bien
            return res.status(200).json({ status: "OK", data: [] });

        } catch (error) {
            console.error("Error en controlador:", error);
            return res.status(500).json({ error: "Error interno" });
        }
    }
}