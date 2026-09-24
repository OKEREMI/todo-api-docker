FROM node:22-slim

WORKDIR /app

RUN apt-get update && apt-get install -y python3 make g++ wget && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm install

COPY . .

RUN groupadd -r appgroup && useradd -r -g appgroup appuser
RUN mkdir -p /data && chown -R appuser:appgroup /data
USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "index.js"]
