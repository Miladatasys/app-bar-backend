# Dockerfile para el backend
FROM node:16

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000  

CMD ["node", "src/server.js"]  # Cambia esto a la ruta de tu archivo principal
