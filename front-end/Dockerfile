# Stage 1: Build the React app
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY front-end/package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY front-end/ .

# Build arguments for environment variables
ARG REACT_APP_API_URL=http://localhost:3000/api
ARG REACT_APP_GOOGLE_MAPS_API_KEY

# Set environment variables for React build
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_GOOGLE_MAPS_API_KEY=$REACT_APP_GOOGLE_MAPS_API_KEY

# Build the React app
RUN npm run build

# Stage 2: Serve with serve
FROM node:18-alpine

# Install serve globally
RUN npm install -g serve

# Copy built app from builder stage
COPY --from=builder /app/build /app/build

# Set working directory
WORKDIR /app

# Expose port
EXPOSE 3000

# Start serve
CMD ["serve", "-s", "build", "-l", "3000"]

