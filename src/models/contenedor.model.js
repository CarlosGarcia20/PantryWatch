import pool from "../config/db.js";

export class contenedorModel {
    static async crear({ nombre, peso, imagen, capacidadGr }) {
        try {
            const { rows } = await pool.query(
                `INSERT INTO 
                contenedores (nombre, peso, imagen, capacidad_gr)
                VALUES ($1, $2, $3, $4)
                RETURNING id`,
                [nombre, peso, imagen, capacidadGr]
            );

            if (rows.length < 0) return { success: false }

            return { success: true }
        } catch (error) {
            return { success: false, error }
        }
    }

    static async obtenerContenedores() {
        try {
            const { rows, rowCount } = await pool.query(
                `SELECT * FROM contenedores
                WHERE estado = 'S'`
            );

            if (rowCount == 0) return { success: false }

            return { success: true, data: rows }
        } catch (error) {
            return { success: false, error}
        }
    }

    static async obtenerContenedorPorId(contenedorId) {
        try {
            const { rows, rowCount } = await pool.query(
                `SELECT * FROM contenedores
                WHERE id = $1`,
                [contenedorId]
            );

            if (rowCount == 0) return { success: false }

            return { success: true, data: rows[0] }
        } catch (error) {
            return { success: false, error}
        }
    }

    static async editarContenedor({ contenedorId, nombre, peso, imagen, capacidad_gr }) {
        try {
            const { rows } = await pool.query(
                `UPDATE contenedores 
                SET
                    nombre = COALESCE($1, nombre),
                    peso = COALESCE($2, peso),
                    capacidad_gr = COALESCE($3, capacidad_gr),
                    imagen = COALESCE($4, imagen)
                WHERE id = $5
                RETURNING id`,
                [
                    nombre, 
                    peso,
                    capacidad_gr,
                    imagen,
                    contenedorId
                ]
            );

            if (rows.length < 0) return { success: false }

            return { success: true }
        } catch (error) {
            return { success: false, error }
        }
    }
    
    static async eliminar(contenedorId) {
        try {
            const { rows } = await pool.query(
                `DELETE FROM contenedores
                WHERE id = $1
                RETURNING *`,
                [contenedorId]
            );

            if (rows.length < 0) {
                return { success: false }
            }

            return { success: true }
        } catch (error) {
            return { success: false, error }
        }
    }
}