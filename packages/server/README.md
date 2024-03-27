# yunti-server

## server for console

## Installation

环境要求：

- **Node.js v18.x**
- **pnpm v8.x**

进入目录安装依赖:

```bash
npm i pnpm @antfu/ni -g
ni
```

## Running the app

yunti-server 依赖 dolt，可以通过 docker 运行一个：

linux

```bash
docker run --name dolt --restart=always \
  -d -p 13306:3306 \
  -v $PWD/dolt/servercfg.d:/etc/dolt/servercfg.d \
  -v $PWD/dolt/databases:/var/lib/dolt \
  -v $PWD/dolt/db/init.sql:/tmp/db/init.sql \
  -v /etc/localtime:/etc/localtime \
  dolthub/dolt-sql-server:1.31.1

docker run --name redis --restart=always \
  -d -p 6379:6379 \
  redis:latest
```

windows

```powershell
docker run --name dolt --restart=always `
       -d -p 13306:3306 `
       -v D:\\playgroupd\yunti-server\dolt\servercfg.d\:/etc/dolt/servercfg.d/ `
       -v D:\\playgroupd\yunti-server\dolt\databases\:/var/lib/dolt/ `
       -v D:\\playgroupd\yunti-server\dolt\db\init.sql:/tmp/db/init.sql `
       dolthub/dolt-sql-server:1.31.1
```

给用户设置密码之类的：
<https://docs.dolthub.com/sql-reference/server/access-management#not-yet-supported>
由于不支持用户的修改命令，需要通过挂载 /etc/dolt/servercfg.d/config.yqml 里设置用户名 / 密码

进入 dolt 容器中：

```bash
docker exec -it dolt bash
# 执行下面的命令可以进入 dolt sql shell
dolt --host 0.0.0.0 --port 3306 -u root -p yunti --no-tls sql
```

使用 dolt sql 初始化数据库：

```bash
dolt config --global --add user.email "yunti@yuntijs.com"
dolt config --global --add user.name "yunti"
dolt --host 0.0.0.0 --port 3306 -u root -p yunti --no-tls sql < /tmp/db/init.sql
```

启动 server：

```bash
# development
$ nr start

# watch mode
$ nr start:dev

# production mode
$ nr start:prod
```

## Test

```bash
# unit tests
$ nr test

# e2e tests
$ nr test:e2e

# test coverage
$ nr test:cov
```

## config

配置详见 [configs/config.default.yaml](configs/config.default.yaml)，下面对 config.default.yaml、config.dev.yaml 和 config.yaml 进行简要说明：

- config.default.yaml 是默认配置
- config.dev.yaml 是开发配置，仅开发时生效，配置后配置项会覆盖默认配置 config.default.yaml
- config.yaml 是运行时配置，配置后配置项会覆盖默认配置 config.default.yaml

**注意：新增配置都应在 config.default.yaml 中进行，config.yaml 的主要用途是在实际运行时可以通过挂载 configMap 的方式来进行配置自定义。**

在实际运行环境中可以通过挂载 configMap 到 `config/configs.yaml` 的方式自定义配置：

- 存储配置的 configMap：

```yaml
apiVersion: v1
data:
  config.yaml: |
    web:
      port: 8034
    log:
      levels: log,error,warn,debug
kind: ConfigMap
metadata:
  name: yunti-server-config
```

- 将存储配置的 configMap 挂载到 deployment 中：

```yaml
kind: Deployment
apiVersion: apps/v1
metadata:
  name: yunti-server
spec:
  replicas: 1
  template:
    spec:
      volumes:
        - name: yunti-server-config-volume
          configMap:
            name: yunti-server-config
      containers:
        - name: yunti-server
          image: yunti-server:1.0
          volumeMounts:
            # 注意只挂载到 configs/config.yaml 上，不要把整个 configs 目录都挂载了
            - name: yunti-server-config-volume
              mountPath: /usr/src/app/configs/config.yaml
              subPath: config.yaml
```

请注意，以上示例是一个简化的配置示例，你需要根据实际的 Deployment 配置进行调整和扩展。

## dolt 数据备份和还原

备份：

```bash
$ docker exec -it dolt bash
$ mkdir -p /backups
$ cd yunti
$ dolt backup add local-backup file:///backups/yunti
$ dolt backup sync local-backup
$ tar -czvf dolt-backups.tar.gz /backups
```

最后将 dolt-backups.tar.gz 文件复制出来就可以了。

还原：

```bash
$ docker cp dolt-backups.tar.gz dolt:/
$ docker exec -it dolt bash
$ tar -xzvf /dolt-backups.tar.gz -C /
$ dolt backup restore file:///backups/yunti yunti-backup
```

退出容器后，将容器重启，yunti-backup 就是还原之后的数据库。
