FROM oven/bun:latest

WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./

# Install dependencies with Bun
RUN bun install --frozen-lockfile

# Copy source
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Default command (can be overridden)
CMD ["bun", "run", "dev"]
