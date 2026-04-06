ARG BUN_VERSION=1.3.9
FROM oven/bun:${BUN_VERSION}-slim AS build
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
COPY ./packages/client/env/.env.output.production ./packages/client/env/
COPY ./packages/client/env/.env.target.local ./packages/client/env/
COPY ./packages/client/public/ ./packages/client/public/
COPY ./packages/client/src/ ./packages/client/src/
COPY ./packages/client/tsconfig/*.json ./packages/client/tsconfig/

# copy server project
COPY ./packages/server/package.json ./packages/server/
COPY ./packages/server/Taskfile.yml ./packages/server/
COPY ./packages/server/env/.env.output.production ./packages/server/env/
COPY ./packages/server/env/.env.target.local ./packages/server/env/
COPY ./packages/server/src/ ./packages/server/src/
COPY ./packages/server/tsconfig/*.json ./packages/server/tsconfig/

# copy shared project
COPY ./packages/shared/package.json ./packages/shared/
COPY ./packages/shared/Taskfile.yml ./packages/shared/
COPY ./packages/shared/generators/ ./packages/shared/generators/
COPY ./packages/shared/src/ ./packages/shared/src/
COPY ./packages/shared/tsconfig/*.json ./packages/shared/tsconfig/

# copy tsconfig project
COPY ./packages/tsconfig/ ./packages/tsconfig/

# build
RUN bun install --frozen-lockfile
RUN bunx --no-install task server:ssg

FROM oven/bun:${BUN_VERSION}-distroless AS runtime
WORKDIR /app

COPY --from=build /app/packages/client/dist ./dist/client
COPY --from=build /app/packages/server/dist ./dist/server
COPY --from=build /app/packages/shared/dist ./dist/shared

ENV NG_ALLOWED_HOSTS=localhost,127.0.0.1,::1
ENV SWAPI_HOST=localhost
ENV SWAPI_TARGET=test

ENV NODE_ENV=production
ENV SWAPI_OUTPUT_MODE=production
ENV SWAPI_LOG_LEVEL=info
ENV SWAPI_PORT=51000

EXPOSE 51000
CMD ["bun", "./dist/server/server.js"]
