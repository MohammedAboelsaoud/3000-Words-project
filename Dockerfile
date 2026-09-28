# Satz: the app, the account server and a SQLite database in one container.
# Build:  docker build -t satz .
# Run:    docker run -p 8080:8080 -v satz-data:/data satz
FROM node:22-slim AS build
WORKDIR /src
COPY app/package.json app/package-lock.json app/
RUN npm ci --prefix app
COPY design-system/project design-system/project
COPY content content
COPY app app
RUN npm run build --prefix app

FROM node:22-slim
ENV NODE_ENV=production PORT=8080 DATA_DIR=/data STATIC_DIR=/srv/app
WORKDIR /srv
COPY server server
COPY --from=build /src/app/dist /srv/app
RUN mkdir -p /data && chown node:node /data
VOLUME /data
EXPOSE 8080
USER node
CMD ["node", "--disable-warning=ExperimentalWarning", "server/index.js"]
