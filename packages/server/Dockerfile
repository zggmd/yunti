FROM yuntijs/yunti-server-dist:main as yunti-server
FROM yuntijs/yunti-console-dist:main as yunti-console

FROM yuntijs/yunti-server:base-1.0-prod

COPY --from=yunti-server /build-files/app /usr/src/app
COPY --from=yunti-console /build-files/app/console /usr/src/app/public/console

EXPOSE 8034

CMD ["node", "dist/server/src/main"]
