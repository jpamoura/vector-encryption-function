# Use a imagem oficial do Node.js 20
FROM node:20-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código fonte
COPY . .

# Expor a porta 8080
EXPOSE 8080

# Definir variável de ambiente para a porta
ENV PORT=8080

# Comando para iniciar a aplicação
CMD ["npm", "start"]
