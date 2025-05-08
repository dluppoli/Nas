FROM node:18-alpine

# Imposta la cartella di lavoro
WORKDIR /app

# Copia i file necessari
COPY package*.json ./

# Installa le dipendenze
RUN npm install

# Copia il resto dell'applicazione
COPY . .

# Espone la porta dell'app
EXPOSE 8080

# Comando di avvio dell'applicazione
CMD ["node", "server.js"]