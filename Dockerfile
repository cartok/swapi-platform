# syntax=docker/dockerfile:1.23
ARG BUN_VERSION=1.3.13
ARG NODE_ENV
ARG PROFILE
ARG TARGET
ARG DEPLOYED_GIT_SHA
ARG VARIANT_ENV_FILE_DOCKER=.env.${TARGET}.${PROFILE}.docker
ARG VARIANT_ENV_FILE=.env.${TARGET}.${PROFILE}
ARG VARIANT_PATH=${TARGET}/${PROFILE}

FROM oven/bun:${BUN_VERSION}-slim AS deps
ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV}
WORKDIR /app

COPY ./.npmrc ./
COPY ./.node-version ./
COPY ./.bun-version ./
COPY ./bun.lock ./
COPY ./package.json ./
COPY --parents ./packages/*/package.json ./

RUN bun install --frozen-lockfile --link-native-bins --no-progress

FROM deps AS code
ARG PROFILE
ARG TARGET
ARG VARIANT_ENV_FILE
ARG VARIANT_ENV_FILE_DOCKER
WORKDIR /app

COPY ./.taskrc.yml ./

COPY ./packages/tsconfig/ ./packages/tsconfig
COPY --parents ./packages/*/tsconfig/*.json ./

COPY ./packages/client/public/ ./packages/client/public
COPY ./packages/client/index.html ./packages/client/

COPY ./packages/client/.env/${VARIANT_ENV_FILE} ./packages/client/.env/
COPY ./packages/server/.env/${VARIANT_ENV_FILE} ./packages/server/.env/
COPY ./packages/server/.env/${VARIANT_ENV_FILE_DOCKER} ./packages/server/.env/

COPY ./packages/client/vite.config.ts ./packages/client/
COPY ./packages/server/rolldown.config.ts ./packages/server/

COPY ./packages/shared/generators/ ./packages/shared/generators
COPY --parents ./packages/*/src/ ./

COPY ./Taskfile.yml ./
COPY --parents ./packages/*/Taskfile.yml ./

FROM code AS build-bundle
ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV}
ARG PROFILE
ARG TARGET
ARG DEPLOYED_GIT_SHA
ENV SWAPI_DEPLOYED_GIT_SHA=${DEPLOYED_GIT_SHA}

RUN bunx --no-install task server:build:bundle TARGET=${TARGET} PROFILE=${PROFILE}

FROM oven/bun:${BUN_VERSION}-distroless AS runtime
ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV}
ARG PROFILE
ARG TARGET
ARG VARIANT_ENV_FILE
ARG VARIANT_ENV_FILE_DOCKER
ARG VARIANT_PATH
WORKDIR /app

# Copy dependant files:
# - The client's dist-dirs.js has to stay in it's dist dir, must not be bundled and
# the root and client package.json's have to exist aswell to have it resolvable.
# To resolve unbundled monorepo files we also need to copy the symlinks in node_modules.
# - The client's browser build and the SSG files also need to be available for the server runtime.
# - The vite manifests for SSR.
COPY --from=deps /app/package.json ./
COPY --from=deps /app/packages/client/package.json ./packages/client/package.json
COPY --from=deps /app/node_modules/@swapi/ ./node_modules/@swapi
COPY --from=build-bundle /app/packages/client/dist/${VARIANT_PATH}/dist-paths.js \
  ./packages/client/dist/${VARIANT_PATH}/
COPY --from=build-bundle /app/packages/client/dist/${VARIANT_PATH}/browser/ \
  ./packages/client/dist/${VARIANT_PATH}/browser
COPY --from=build-bundle /app/packages/client/dist/${VARIANT_PATH}/ssg/ \
  ./packages/client/dist/${VARIANT_PATH}/ssg
COPY --from=build-bundle /app/packages/client/dist/${VARIANT_PATH}/ssr/.vite/ \
  ./packages/client/dist/${VARIANT_PATH}/ssr/.vite

# Copy server files:
# To start the server we additionally need the server's environment files and the server bundle.
# The variant bundle is copied into a dedicated folder in the working directory, so that
# the entrypoint can be executed in the CMD by exit form, in order to ensure correct
# process signal behavior.
COPY --from=code /app/packages/server/.env/ ./packages/server/.env
COPY --from=build-bundle /app/packages/server/dist/${VARIANT_PATH}/bundle/ \
  ./server-variant-bundle

# As this is the distroless bun image, the bun parameters are set by environment variable.
ENV BUN_OPTIONS="\
--conditions @swapi/${VARIANT_PATH} \
--conditions @swapi/${PROFILE} \
--env-file ./packages/server/.env/${VARIANT_ENV_FILE} \
--env-file ./packages/server/.env/${VARIANT_ENV_FILE_DOCKER} \
"

# Start the server.
CMD ["./server-variant-bundle/server.js"]
