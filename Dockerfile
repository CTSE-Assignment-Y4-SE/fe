# Use Node.js official image as the base
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json, pnpm-lock.yaml, and .npmrc if needed
COPY package.json pnpm-lock.yaml ./

# Install pnpm globally
RUN npm install -g pnpm

# Install dependencies using pnpm
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the React application
RUN pnpm run build

# Use a smaller base image for serving the app
FROM node:20-alpine

# Set the working directory for the runtime
WORKDIR /app

# Install a lightweight static file server like `serve`
RUN npm install -g serve

# Copy the build output from the builder stage
COPY --from=builder /app/dist ./dist

# Expose port 5000
EXPOSE 5000

# Command to serve the app
CMD ["serve", "-s", "dist", "-l", "5000"]
