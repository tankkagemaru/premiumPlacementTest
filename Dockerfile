FROM node:20-alpine

WORKDIR /app

# Install dependencies first (best layer caching)
COPY package.json ./
COPY package-lock.json* ./
RUN npm install --loglevel=error

# Copy the rest of the source and build the React app
COPY . .
RUN npm run build

# server.mjs reads process.env.PORT; Zeabur will set it to 8080.
EXPOSE 8080

# Run the Express host (server.mjs) — NOT Caddy.
CMD ["node", "server.mjs"]
