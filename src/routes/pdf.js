require('dotenv').config();
const express = require('express');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const { Configuration, OpenAIApi } = require('openai');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de OpenAI
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API,
});
const openai = new OpenAIApi(configuration);

// Middleware para subir archivos
const upload = multer({ dest: 'uploads/' });

// Ruta para procesar el PDF
app.post('/api/process-menu', upload.single('file'), async (req, res) => {
    console.log('Archivo recibido:', req.file);

    if (!req.file) {
        console.error('No se encontró el archivo.');
        return res.status(400).json({ message: 'Archivo no encontrado.' });
    }

    try {
        console.log('Iniciando OCR...');
        const text = await Tesseract.recognize(req.file.path, 'eng', {
            logger: (info) => console.log('Progreso OCR:', info),
        });

        console.log('Texto extraído:', text.data.text);

        console.log('Enviando texto a OpenAI para formatear...');
        const prompt =
        `Toma el siguiente texto extraído de un menú en formato pdf,y conviértelo en el formato JSON que requiere el sistema:
        [{"name": "Nombre del producto",
        "description": "Descripción del producto",
        "price": "Precio del producto",
        "category": "Categoría ('drink', 'food')"}]
        Texto del menú:${text.data.text}`;

        const response = await openai.createCompletion({
            model: 'text-davinci-003',
            prompt,
            max_tokens: 1000,
            temperature: 0.2,
        });

        const formattedData = JSON.parse(response.data.choices[0].text.trim());
        console.log('Datos formateados:', formattedData);

        res.status(200).json({ message: 'Archivo procesado exitosamente.', data: formattedData });
    } catch (error) {
        console.error('Error al procesar el menú:', error.message);
        res.status(500).json({ message: 'Error al procesar el archivo.' });
    } finally {
        console.log('Eliminando archivo temporal...');
        fs.unlinkSync(req.file.path);
    }
});

app.listen(PORT, () => console.log(`Servidor ejecutándose en http://localhost:${PORT}`));
