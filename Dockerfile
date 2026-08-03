FROM node:22-alpine

LABEL org.opencontainers.image.source="https://github.com/nhantour/genie-locker"
LABEL org.opencontainers.image.description="Read-only MCP connector for GenieLocker private inference"
LABEL io.modelcontextprotocol.server.name="io.github.nhantour/genie-locker"

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY src ./src

USER node
ENTRYPOINT ["node", "src/index.js"]
