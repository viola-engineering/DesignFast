FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies for native modules (bcrypt)
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy backend source and examples
COPY backend/ ./backend/
COPY examples/ ./examples/

FROM node:20-alpine

WORKDIR /app

# Copy built node_modules and source
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/examples ./examples
COPY --from=builder /app/package.json ./

ENV NODE_ENV=production

# MODE: "api" or "worker" (omit for both - dev mode)
CMD ["node", "-r", "dotenv/config", "backend/src/server.js"]
