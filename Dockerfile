# Multi-stage build: build with Node, serve with nginx
FROM node:18-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --silent

# Copy source
COPY . .

# Accept build-time args for Vite env variables and write a .env for Vite to pick up
ARG VITE_API_URL
ARG VITE_WHATSAPP_API_URL
RUN printf "VITE_API_URL=%s\nVITE_WHATSAPP_API_URL=%s\n" "$VITE_API_URL" "$VITE_WHATSAPP_API_URL" > .env

# Build the app
RUN npm run build

# Production image
FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY ssl /etc/nginx/ssl

EXPOSE 80
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]
