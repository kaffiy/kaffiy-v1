# Stage 1: Build the application
FROM node:20-alpine AS build

WORKDIR /app

# Configure npm for better reliability
ENV NPM_CONFIG_LOGLEVEL=warn
ENV NPM_CONFIG_FETCH_RETRY_MINTIMEOUT=20000
ENV NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT=120000

# Copy package files
COPY package*.json ./

# Install dependencies with increased timeout
RUN npm install --legacy-peer-deps --no-audit --prefer-offline || \
    npm install --legacy-peer-deps --no-audit

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:1.27-alpine

# Copy built files
COPY --from=build /app/dist /usr/share/nginx/html

# Create nginx config
RUN echo 'server { \
    listen 8001; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Remove default nginx config
RUN rm -f /etc/nginx/conf.d/default.conf.default

EXPOSE 8001

# Run as root to avoid permission issues
CMD ["nginx", "-g", "daemon off;"]
