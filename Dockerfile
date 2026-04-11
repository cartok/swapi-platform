ARG BUN_VERSION=1.3.9
ARG TARGET
ARG MODE

FROM oven/bun:${BUN_VERSION}-slim AS deps
ARG TARGET
ARG MODE
WORKDIR /app

COPY ./.node-version ./
COPY ./.npmrc ./
COPY ./bun.lock ./
COPY ./package.json ./
COPY ./packages/tsconfig/package.json ./packages/tsconfig/
COPY ./packages/shared/package.json ./packages/shared/
COPY ./packages/server/package.json ./packages/server/
COPY ./packages/client/package.json ./packages/client/

RUN bun install --frozen-lockfile

FROM deps AS code
ARG TARGET
ARG MODE
WORKDIR /app

COPY ./.taskrc.yml ./

COPY ./packages/tsconfig/ ./packages/tsconfig

COPY ./packages/client/public/ ./packages/client/public

COPY ./packages/client/.env/ ./packages/client/.env/
COPY ./packages/server/.env/ ./packages/server/.env/

COPY ./packages/client/index.html ./packages/client/

COPY ./packages/shared/tsconfig/*.json ./packages/shared/tsconfig/
COPY ./packages/server/tsconfig/*.json ./packages/server/tsconfig/
COPY ./packages/client/tsconfig/*.json ./packages/client/tsconfig/

COPY ./Taskfile.yml ./

COPY ./packages/client/vite.config.ts ./packages/client/
COPY ./packages/server/rolldown.config.ts ./packages/server/

COPY ./packages/shared/generators/ ./packages/shared/generators
COPY ./packages/shared/src/ ./packages/shared/src
COPY ./packages/server/src/ ./packages/server/src
COPY ./packages/client/src/ ./packages/client/src

COPY ./packages/shared/Taskfile.yml ./packages/shared/
COPY ./packages/server/Taskfile.yml ./packages/server/
COPY ./packages/client/Taskfile.yml ./packages/client/

FROM code AS build-bundle
ARG TARGET
ARG MODE
RUN bunx --no-install task server:bundle TARGET=${TARGET} MODE=${MODE}

FROM oven/bun:${BUN_VERSION}-distroless AS runtime
ARG TARGET
ARG MODE
WORKDIR /app

COPY --from=deps /app/node_modules/ ./node_modules

COPY ./packages/server/.env/ ./packages/server/.env

COPY --from=build-bundle \
  /app/packages/server/dist/${TARGET}/${MODE}/bundle/ \
  ./packages/server/dist/${TARGET}/${MODE}/bundle/

COPY --from=build-bundle \
  /app/packages/client/dist/${TARGET}/${MODE}/ \
  ./packages/client/dist/${TARGET}/${MODE}/

COPY ./package.json ./
COPY ./packages/shared/package.json ./packages/shared/package.json
COPY ./packages/client/package.json ./packages/client/package.json

COPY ./packages/shared/src/environment/env.ts ./packages/shared/src/environment/env.ts

COPY ./packages/server/docker/create-bundle-link.ts ./
COPY ./packages/server/docker/start-server-bundle.ts ./

ENV SWAPI_TARGET=${TARGET}
ENV SWAPI_OUTPUT_MODE=${MODE}
RUN ["bun", "--conditions", "@swapi/source", "./create-bundle-link.ts"]

ENV SWAPI_SERVER_PORT=51000
EXPOSE ${SWAPI_SERVER_PORT}
CMD ["--conditions", "@swapi/source", "./start-server-bundle.ts"]
