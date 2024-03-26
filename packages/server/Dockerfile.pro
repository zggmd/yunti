FROM --platform=linux/amd64 node:18.16-alpine
LABEL maintainer="zhangpc<zhangpc@tenxcloud.com>"

# If you have native dependencies, you'll need extra tools
# RUN apk add --no-cache openssh

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Set env
ENV NODE_ENV production
ENV NODE_TLS_REJECT_UNAUTHORIZED 0

# Install dependencies modules
COPY package.json /usr/src/app/
COPY pnpm-lock.yaml /usr/src/app/
RUN npm i pnpm @antfu/ni -g \
  && ni --ignore-scripts
