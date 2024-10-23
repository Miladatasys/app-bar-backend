FROM node:16-alpine

# Instala git
RUN apk update && apk add git

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos package.json y package-lock.json primero para aprovechar el cacheo de Docker si no cambian
COPY package*.json ./

# Instala todas las dependencias de desarrollo y producción
RUN npm install

# Copia el resto de los archivos
COPY . .

# Expone el puerto 3000 para la API
EXPOSE 3000

# Establece la variable de entorno NODE_ENV como desarrollo
ENV NODE_ENV=development

# Comando para iniciar la aplicación
CMD ["node", "src/server.js"]
