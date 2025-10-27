# Dockerfile for the frontend application
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application files
COPY . .

# Expose port
EXPOSE 8000

# Start the dev server
CMD ["npm", "start"]
