import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

export const subirImagenCloudinary = async (rutaArchivoLocal) => {
    try {
        const resultado = await cloudinary.uploader.upload(rutaArchivoLocal, {
            folder: 'pantrywatch_productos',
            use_filename: true
        });
        
        return resultado.secure_url;
    } catch (error) {
        console.error("Error subiendo a Cloudinary:", error);
        throw error;
    }
};

export const subirImagenContenedor = async(rutaArchivo) => {
    try {
        const resultado = await cloudinary.uploader.upload(rutaArchivo, {
            folder: 'pantrywatch_contenedores',
            use_filename: true
        });

        fs.unlinkSync(rutaArchivo);

        return resultado.secure_url
    } catch (error) {
        console.error("Error subiendo imagen de contenedor: ", error);
        if (fs.existsSync(rutaArchivo)) fs.unlinkSync(rutaArchivo);
        throw error;
    }
}

export const eliminarImagenContenedor = async(urlImagen) => {
    if (!urlImagen) return;

    try {
        const partes = urlImagen.split('/');
        const archivoConExtension = partes.pop();
        const carpeta = partes.pop(); 
        const publicId = `${carpeta}/${archivoConExtension.split('.')[0]}`;

        console.log(`🗑️ Borrando de Cloudinary: ${publicId}`);

        await cloudinary.uploader.destroy(publicId);

        return true;
    } catch (error) {
        console.error("⚠️ Error borrando imagen de Cloudinary (No crítico):", error);
        return false;
    }
}