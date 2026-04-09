ARG BUN_VERSION=1.3.9
ARG SWAPI_OUTPUT_MODE=production
ARG SWAPI_TARGET=local

FROM oven/bun:${BUN_VERSION}-slim AS build
ARG SWAPI_OUTPUT_MODE
ARG SWAPI_TARGET
ENV SWAPI_OUTPUT_MODE=${SWAPI_OUTPUT_MODE}
ENV SWAPI_TARGET=${SWAPI_TARGET}
WORKDIR /app

# copy root files
COPY ./.node-version ./
COPY ./.npmrc ./
COPY ./.taskrc.yml ./
COPY ./bun.lock ./
COPY ./package.json ./
COPY ./Taskfile.yml ./

# copy client project
COPY ./packages/client/index.html ./packages/client/
COPY ./packages/client/package.json ./packages/client/
COPY ./packages/client/Taskfile.yml ./packages/client/
COPY ./packages/client/vite.config.ts ./packages/client/
COPY ./packages/client/.env/ ./packages/client/.env/
COPY ./packages/client/tsconfig/*.json ./packages/client/tsconfig/
COPY ./packages/client/public/ ./packages/client/public
COPY ./packages/client/src/ ./packages/client/src

# copy server project
COPY ./packages/server/package.json ./packages/server/
COPY ./packages/server/rolldown.config.ts ./packages/server/
COPY ./packages/server/Taskfile.yml ./packages/server/
COPY ./packages/server/.env/ ./packages/server/.env/
COPY ./packages/server/tsconfig/*.json ./packages/server/tsconfig/
COPY ./packages/server/src/ ./packages/server/src

# copy shared project
COPY ./packages/shared/package.json ./packages/shared/
COPY ./packages/shared/Taskfile.yml ./packages/shared/
COPY ./packages/shared/tsconfig/*.json ./packages/shared/tsconfig/
COPY ./packages/shared/generators/ ./packages/shared/generators
COPY ./packages/shared/src/ ./packages/shared/src

# copy tsconfig project
COPY ./packages/tsconfig/ ./packages/tsconfig

# copy scripts
COPY ./scripts/ ./scripts

# build
RUN bun install --frozen-lockfile
RUN bunx --no-install task server:bundle TARGET=${SWAPI_TARGET} MODE=${SWAPI_OUTPUT_MODE}

FROM oven/bun:${BUN_VERSION}-distroless AS runtime
ARG SWAPI_OUTPUT_MODE
ARG SWAPI_TARGET
ENV SWAPI_OUTPUT_MODE=${SWAPI_OUTPUT_MODE}
ENV SWAPI_TARGET=${SWAPI_TARGET}
WORKDIR /app

COPY --from=build /app/package.json /app
COPY --from=build /app/node_modules/ /app/node_modules
COPY --from=build \
  /app/packages/client/dist/${SWAPI_TARGET}/${SWAPI_OUTPUT_MODE}/ \
  /app/packages/client/dist/${SWAPI_TARGET}/${SWAPI_OUTPUT_MODE}/
COPY --from=build \
  /app/packages/server/dist/${SWAPI_TARGET}/${SWAPI_OUTPUT_MODE}/bundle/ \
  /app/packages/server/dist/${SWAPI_TARGET}/${SWAPI_OUTPUT_MODE}/bundle/

COPY ./scripts/docker/create-bundle-link.ts ./scripts/docker/
RUN ["bun", "./scripts/docker/create-bundle-link.ts"]

ENV NG_ALLOWED_HOSTS=localhost,127.0.0.1,::1
ENV NODE_ENV=${SWAPI_OUTPUT_MODE}
ENV SWAPI_LOG_LEVEL=info
ENV SWAPI_SERVER_HOST=localhost
ENV SWAPI_SERVER_PACKAGE_DIR=./packages/server
ENV SWAPI_SERVER_PORT=51000

EXPOSE ${SWAPI_SERVER_PORT}
CMD ["./bundle-link/server.js"]
