FROM --platform=linux/amd64 node:20-alpine

# If you have native dependencies, you'll need extra tools
RUN apk add --no-cache bash git openssh

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install dependencies modules
COPY package.json /usr/src/app/
COPY pnpm-lock.yaml /usr/src/app/
COPY pnpm-workspace.yaml /usr/src/app/
COPY .npmrc /usr/src/app/
ADD packages/shared-components /usr/src/app/packages/shared-components
ADD packages/confirm /usr/src/app/packages/confirm
ADD packages/k8s-client /usr/src/app/packages/k8s-client
COPY packages/server/package.json /usr/src/app/packages/server/
COPY packages/console/package.json /usr/src/app/packages/console/

RUN npm i pnpm -g
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    --mount=type=secret,id=npmrc,target=/root/.npmrc \
     pnpm install --frozen-lockfile --ignore-scripts
