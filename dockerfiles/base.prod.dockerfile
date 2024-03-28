FROM --platform=linux/amd64 node:20-alpine

# Create app directory
RUN mkdir -p /usr/src/app/packages/server
WORKDIR  /usr/src/app/packages/server

# Set env
ENV NODE_ENV production

# Install dependencies modules
COPY package.json /usr/src/app/
COPY pnpm-lock.yaml /usr/src/app/
COPY pnpm-workspace.yaml /usr/src/app/
COPY .npmrc /usr/src/app/
ADD packages/k8s-client /usr/src/app/packages/k8s-client
COPY packages/server/package.json /usr/src/app/packages/server/

RUN npm i pnpm -g
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
     pnpm install --prod --frozen-lockfile --ignore-scripts
