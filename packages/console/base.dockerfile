# dockerfile of base image
FROM --platform=linux/amd64 node:18.16-alpine
LABEL maintainer="Carrotzpc<zhang.pc3@gmail.com>"

# If you have native dependencies, you'll need extra tools
RUN apk add --no-cache curl bash git openssh

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install dependencies modules
COPY package.json /usr/src/app/
COPY pnpm-lock.yaml /usr/src/app/
COPY .npmrc /usr/src/app/
RUN npm i pnpm @antfu/ni -g \
  && ni
