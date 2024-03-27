function readPackage(pkg, context) {
  // @ant-design/pro-card
  // @ant-design/pro-layout
  // @ant-design/pro-provider
  // @ant-design/pro-utils
  // if (pkg.name === '@formily/antd' || pkg.name === '@seada/antd-setters') {
  if (pkg.name === '@umijs/max') {
    pkg.dependencies = {
      ...pkg.dependencies,
      "antd": "^5.1.5",
    }
  }

  return pkg;
}

module.exports = {
  hooks: {
    readPackage
  }
}
