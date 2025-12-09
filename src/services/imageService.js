import cloudinary from '../config/cloudinary.js';

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