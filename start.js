const ngrok = require('ngrok');
const fs = require('fs');
const { exec } = require('child_process');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

(async function () {
    try {
        console.log('Iniciando ngrok...');
        const url = await ngrok.connect({ addr: PORT, apiPort: 4041 }); // Cambia el puerto de la API a 4041
        console.log(`URL pública generada: ${url}`);

        // Actualizar el archivo .env con la nueva URL
        const envPath = './.env';
        const envData = fs.readFileSync(envPath, 'utf-8');
        const updatedEnvData = envData.replace(/BASE_URL=.*/g, `BASE_URL=${url}`);
        fs.writeFileSync(envPath, updatedEnvData);
        console.log('Archivo .env actualizado con la nueva BASE_URL.');

        // Iniciar el servidor
        console.log('Iniciando el servidor...');
        const server = exec('node src/server.js');

        server.stdout.on('data', (data) => console.log(data));
        server.stderr.on('data', (data) => console.error(data));

        server.on('close', (code) => {
            console.log(`Servidor finalizado con código: ${code}`);
            ngrok.disconnect();
            console.log('Conexión ngrok cerrada.');
        });
    } catch (error) {
        console.error('Error al iniciar ngrok o actualizar .env:', error);
    }
})();
