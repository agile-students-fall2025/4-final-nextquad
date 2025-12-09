# Stage 1: Build the React app
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY front-end/package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY front-end/ .

# Copy back-end .env to read GOOGLE_MAPS_API_KEY (build context is root directory)
COPY back-end/.env /tmp/backend.env

# Build arguments for environment variables
ARG REACT_APP_API_URL=http://localhost:3000/api
ARG REACT_APP_GOOGLE_MAPS_API_KEY

# Set default environment variables
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Read GOOGLE_MAPS_API_KEY from backend .env if not provided as build arg, then set ENV and build
RUN if [ -f /tmp/backend.env ] && [ -z "$REACT_APP_GOOGLE_MAPS_API_KEY" ]; then \
      REACT_APP_GOOGLE_MAPS_API_KEY=$(grep -E '^GOOGLE_MAPS_API_KEY=' /tmp/backend.env | cut -d '=' -f2- | tr -d '"' | tr -d "'" | xargs); \
      export REACT_APP_GOOGLE_MAPS_API_KEY; \
    fi && \
    export REACT_APP_GOOGLE_MAPS_API_KEY=${REACT_APP_GOOGLE_MAPS_API_KEY:-} && \
    npm run build

# Set environment variable for reference (build already happened above)
ENV REACT_APP_GOOGLE_MAPS_API_KEY=${REACT_APP_GOOGLE_MAPS_API_KEY:-}

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

