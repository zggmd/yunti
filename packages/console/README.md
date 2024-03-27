# yunti-console

Console of yunti lowcode platform

---

## wiki 文档

- [代码生成 / 前端 portal 初始化](./wiki/gen-code/index.md)

## 开发构建

环境要求：

- **Node.js v18.x**
- **pnpm v8.x**

### 快速开始

克隆项目文件:

```bash
git clone https://github.com/yunti-ui/yunti.git
```

进入目录安装依赖:

```bash
cd yunti
npm i pnpm @antfu/ni -g
ni
```

开发：

```bash
nr dev:console
```

调试：

打开 <http://localhost:8000/yunti/bff?redirect_uri=http://localhost:8000/yunti/callback/oidc> 进行登录调试

构建：

```bash
nr build
```

代码检测：

```bash
nr run lint
```
