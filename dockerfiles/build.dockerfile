FROM yuntijs/yunti-base:alpha as builder

ARG GITHUB_SHA
ENV GITHUB_SHA=$GITHUB_SHA
ENV NODE_ENV production

ADD packages/server /usr/src/app/packages/server
ADD packages/k8s-client /usr/src/app/packages/k8s-client
ADD packages/shared-components /usr/src/app/packages/shared-components
ADD packages/console /usr/src/app/packages/console

WORKDIR /usr/src/app
RUN npm run build

FROM yuntijs/busybox
COPY --from=builder /usr/src/app/packages/server/configs /build-files/configs
COPY --from=builder /usr/src/app/packages/server/dist /build-files/dist
COPY --from=builder /usr/src/app/packages/server/public /build-files/public
COPY --from=builder /usr/src/app/packages/console/dist/console /build-files/public/console
