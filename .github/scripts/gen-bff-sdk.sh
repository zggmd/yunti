#!/bin/bash
set -x

SERVER_PATH="$(pwd)/packages/server"

# run dolt container
docker run --name dolt \
  -d -p 13306:3306 \
  -v ${SERVER_PATH}/dolt/servercfg.d:/etc/dolt/servercfg.d \
  -v ${SERVER_PATH}/dolt/databases:/var/lib/dolt \
  -v ${SERVER_PATH}/dolt/db/init.sql:/tmp/db/init.sql \
  -v /etc/localtime:/etc/localtime \
  dolthub/dolt-sql-server:latest

# init yunti db
sleep 5;
docker exec dolt bash -c 'dolt --host 0.0.0.0 --port 3306 -u root -p yunti --no-tls sql < /tmp/db/init.sql'

# run redis container
docker run --name redis -d -p 6379:6379 redis:latest

# build and run server
pnpm run build:server
pnpm --filter 'yunti-server' start:prod > server.log&

# run sdk gen
GRL_SDK_GENERATOR_IMAGE="yuntijs/gql-sdk-generator:latest"
GRAPH_API_ENDPOINT="http://0.0.0.0:8034/-/yunti/api"
GRAPH_CLIENT_ENDPOINT="/-/yunti/api"
GRL_SDK_TEST_ONLY=${GRL_SDK_TEST_ONLY:-true}
if [ "$GRL_SDK_TEST_ONLY" = "false" ]; then
    DOCKER_ENV_TEST_ONLY=""
else
    DOCKER_ENV_TEST_ONLY="--env TEST_ONLY=true"
fi

docker run --rm --net=host --env SDK_PACKAGE_NAME=@yuntijs/yunti-bff-sdk \
  --env SDK_YUNTI_NAME=YuntiBffClient --env GRAPH_API_ENDPOINT=${GRAPH_API_ENDPOINT} \
  --env GRAPH_CLIENT_ENDPOINT=${GRAPH_CLIENT_ENDPOINT} ${DOCKER_ENV_TEST_ONLY} \
  --env SDK_RELEASE_TYPE=${SDK_RELEASE_TYPE} \
  --env HOOKS_EXTRA_PARAM=${HOOKS_EXTRA_PARAM} \
  --env HOOKS_EXTRA_PARAM_DEFAULT_VALUE=${HOOKS_EXTRA_PARAM_DEFAULT_VALUE} \
  -v ${SERVER_PATH}/src:/schema \
  -v ~/.npmrc:/root/.npmrc ${GRL_SDK_GENERATOR_IMAGE}

cat server.log
