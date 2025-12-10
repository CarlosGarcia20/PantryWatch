import pool from "../config/db.js";

export class productoModelo {
    static async crear({ 
        nombre, contenedorId, pesoUnitario, pesoActual, stockMinimo,
        stockActual, tempMax, humedadMax
    }) {
        try {
            const { rows } = await pool.query(
                `INSERT INTO 
                productos (nombre, contenedor_id, peso_unitario, peso_actual, stock_minimo,
                    stock_actual, temp_max, humedad_max)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING id_producto`,
                [
                    nombre,
                    contenedorId,
                    pesoUnitario,
                    pesoActual,
                    stockMinimo,
                    stockActual,
                    tempMax,
                    humedadMax
                ]
            );

            if (rows.length < 0) return { success: false }

            return { success: true }
        } catch (error) {
            return { success: false, error }
        }
    }

    static async editarProducto({
        productoId, nombre, contenedorId, pesoUnitario, pesoActual, stockMinimo,
        stockActual, tempMax, humedadMax
    }) {
        try {
            
            const { rows } = await pool.query(
                `UPDATE productos
                SET 
                    nombre = COALESCE($1, nombre),
                    contenedor_id = COALESCE($2, contenedor_id),
                    peso_unitario = COALESCE($3, peso_unitario),
                    peso_actual = COALESCE($4, peso_actual),
                    stock_minimo = COALESCE($5, stock_minimo),
                    stock_actual = COALESCE($6, stock_actual),
                    temp_max = COALESCE($7, temp_max),
                    humedad_max = COALESCE($8, humedad_max)
                WHERE id_producto = $9`,
                [
                    nombre,
                    contenedorId,
                    pesoUnitario,
                    pesoActual,
                    stockMinimo,
                    stockActual,
                    tempMax,
                    humedadMax,
                    productoId
                ]
            );
    
            if (rows.length < 0) return { success: false }
    
            return { success: true }
        } catch (error) {
            return { success: false, error }
        }
    }
    
    static async obtenerProductos() {
        try {
            const { rows } = await pool.query(
                `SELECT 
                    productos.*,
                    contenedores.nombre AS contenedor
                FROM productos
                LEFT JOIN contenedores ON productos.contenedor_id = contenedores.id`
            );

            if (rows.length < 0) return { success: false }

            return { success: true, data: rows }
        } catch (error) {
            return { success: false, error }
        }
    }
    
    static async eliminarProducto(productoId) {
        try {

            const { rowCount } = await pool.query(
                `DELETE FROM productos WHERE id_producto = $1`,
                [productoId]
            );

            if (rowCount == 0) return { success: false }

            return { success: true }
        } catch (error) {
            return { success: false, error }
        }
    }
}