export class sensorController {
    static async recibirDatosSensor(req,res) {
        try {
            const { zona, temperatura, humedad } = req.body;

            // Validación básica
            if (!zona || temperatura === undefined || humedad === undefined) {
                return res.status(400).json({ error: "Faltan datos (zona, temperatura, humedad)" });
            }

            console.log(`📥 API: Recibido de ${zona} -> T:${temperatura} H:${humedad}`);

            // Llamamos al servicio (Caja negra)
            const alertas = await prologService.procesarDatosSensor(zona, temperatura, humedad);

            if (alertas.length > 0) {
                console.log("   🔥 Respondiendo ALERTA al ESP32");
                return res.status(200).json({ status: "ALERTA", data: alertas });
            }

            return res.status(200).json({ status: "OK", data: [] });
        } catch (error) {
            console.error("Error en controlador:", error);
            return res.status(500).json({ error: "Error interno del servidor" });
        }
    }
}