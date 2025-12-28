FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Hardcode env vars for Vite build (these are public values, not secrets)
ENV VITE_SUPABASE_URL=https://qxrgejdfxcvsfktgysop.supabase.co
ENV VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4cmdlamRmeGN2c2ZrdGd5c29wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNjQzNTksImV4cCI6MjA4MTg0MDM1OX0.oe7awPK-K6vIHiP64peWztuAABOw4Hb9r6SHqwdb9B0
ENV VITE_API_URL=https://rgfl-api-production.up.railway.app

# Build the app
RUN npm run build && ls -la dist/

# Production stage - tiny nginx image for static files
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config for SPA routing
RUN echo 'server { \
    listen 80; \
    listen [::]:80; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Railway sets PORT env var
CMD sh -c "sed -i 's/listen 80/listen ${PORT:-3000}/g' /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"
