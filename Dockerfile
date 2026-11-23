# Use Node 24 on Debian 11 (Bullseye) which has OpenSSL 1.1 for Prisma compatibility
FROM node:24-bullseye-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Generate Prisma clients
RUN npm run build

# Expose port
EXPOSE 8080

# Start the application
CMD ["npm", "start"]
