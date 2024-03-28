FROM --platform=linux/amd64 yuntijs/yunti-dist:alpha as dist
FROM yuntijs/yunti-base-prod:alpha

COPY --from=dist /build-files/configs ./configs
COPY --from=dist /build-files/dist ./dist
COPY --from=dist /build-files/public ./public
COPY --from=dist /build-files/public/console ./public/console

EXPOSE 8034

CMD ["node", "dist/server/src/main"]
