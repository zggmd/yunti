FROM yuntijs/yunti-console:base-1.0 as builder

COPY . /usr/src/app/

# package files
RUN npm run build && \
  mv dist /tmp/yunti-console && \
  mv .gitdiff /tmp/yunti-console/console && \
  mv .gitversion /tmp/yunti-console/console

FROM yuntijs/busybox:tenx
COPY --from=builder /tmp/yunti-console /build-files/app
