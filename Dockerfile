FROM node:16-alpine

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos package.json y package-lock.json primero para aprovechar el cacheo de Docker si no cambian
COPY package*.json ./

# Instala solo las dependencias de producción (opcional si no estás haciendo pruebas en Docker)
RUN npm install --production

# Copia el resto de los archivos
COPY . .

# Expone el puerto 3000 para la API
EXPOSE 3000

# Establece la variable de entorno NODE_ENV como desarrollo o producción
ENV NODE_ENV=development

# Comando para iniciar la aplicación
CMD ["node", "src/server.js"]
