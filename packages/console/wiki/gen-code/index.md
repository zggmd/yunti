# 前端 portal 初始化

@yunti/lowcode-code-generator 一般用作低码项目出码，也可用于前端项目的初始化。

## 如何使用

先在 schema.json 中配置下 portal 的基础信息：

```json
// schema.json
{
  "meta": {
    "name": "umi 示例 portal",
    "namespace": "umi-demo-portal",
    "description": "demo portal init by @yunti/lowcode-code-generator with umijs template",
    "port": "8168",
    "basename": "/umi-demo"
  }
}
```

然后执行以下命令即可：

```sh
npx @yunti/lowcode-code-generator@latest --init -i schema.json -o umi-demo-portal -s umi
```

初始化项目后需要再初始化下 submodule 以及 git hooks 工具 husky，记得提交初始化好的 husky 脚本：

```bash
cd umi-demo-portal

# 初始化 submodule
git submodule add https://github.com/kubebb/portal-contrib.git

# 初始化 husky
npx husky add .husky/pre-commit 'npm run lint-staged'
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"'
chmod +x .husky/pre-commit .husky/commit-msg
# 记得提交初始化好的 husky 脚本
git add .husky/
```

这样会以 schema.json 为配置，使用 umi 模板将项目生成到 umi-demo-portal 目录中，详见 <https://github.com/yuntijs/umi-demo-portal> 。

## schema.json 配置说明

可以下载 [schema.json](./schema.json) 模板，基于模板修改，可以自定义的字段只有 meta 和 config，**注意其他字段不能删除**，meta 中可以定义项目的基本信息，config 中定义的是 antd [ConfigProvider](https://ant.design/components/config-provider-cn#api) 的配置，使用默认配置时这一项可不填。

meta 中的字段说明：

```js
{
  "meta": {
    // 项目名称，可以为中文
    "name": "umi 示例 portal",
    // 项目命名空间，必须是英文，命名规范与 GitHub 项目名一致
    "namespace": "umi-demo-portal",
    // 项目描述
    "description": "demo portal init by @yunti/lowcode-code-generator with umijs template",
    // 项目端口
    "port": "8168",
    // 项目路由前缀
    "basename": "/umi-demo",
    // 项目 git 地址
    "git_url": "https://github.com/yuntijs/umi-demo-portal.git"
  },
}
```

config 中的字段说明详见 <https://ant.design/components/config-provider-cn#api> 。

[schema.json](./schema.json) 模板内容：

```json
{
  "config": {
    "componentSize": "middle",
    "space": {
      "size": 12
    },
    "theme": {
      "components": {
        "Page": {
          "pagePadding": 20,
          "pagePaddingBottom": 32,
          "pagePaddingTop": 20
        },
        "Row": {
          "rowHorizontalGutter": 20,
          "rowVerticalGutter": 20
        }
      },
      "token": {
        "borderRadius": 2,
        "colorPrimary": "#00b96b",
        "fontSize": 12
      }
    }
  },
  "meta": {
    "name": "umi 示例 portal",
    "namespace": "umi-demo-portal",
    "description": "demo portal init by @yunti/lowcode-code-generator with umijs template",
    "port": "8168",
    "basename": "/umi-demo",
    "git_url": "https://github.com/yuntijs/umi-demo-portal.git"
  },
  "version": "1.0.0"
}
```
