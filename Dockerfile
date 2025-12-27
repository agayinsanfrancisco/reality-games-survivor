FROM node:20-alpine

WORKDIR /app

# Copy server package files
COPY server/package*.json ./server/

# Install dependencies including devDependencies for build
WORKDIR /app/server
RUN npm ci --include=dev

# Copy server source
COPY server/ ./

# Build TypeScript
RUN npm run build

# Remove devDependencies after build
RUN npm prune --production

# Expose port
EXPOSE 3001

# Start server
CMD ["node", "dist/server.js"]
