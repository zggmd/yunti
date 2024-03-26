# 分支

首先要说明的是，dolt 的分支是整个数据库维度的，但是为了便于应用以及组件等的开发，以应用为例，会在每个应用的维度来管理各自应用的分支。

## 应用分支的设计思想

应用的分支分为 3 类：

1. 默认主分支：创建应用时，会默认基于 `main` 分支创建一个应用的默认分支 `<应用 ID>/main`
2. 发版分支：以 'release-' 开头的分支比较特殊，仅 Owner 及 Maintainer 可创建编辑，不过所有应用成员均拥有读取权限，发版分支的命名形式为：`<应用 ID>/release-<版本>`
3. 开发分支：用户各自创建的非发版分支都属于开发分支，这些分支仅创建人可见，当开完完成一个功能后，可以将开发分支的更改提交 merge 到发版分支，开发分支的命名形式为：`<应用 ID>/<用户 ID>/分支展示名`

下面以 bc-console (应用 ID 为 `app-4tqxv`) 为例说明：

```
+--------------------------+----------------------------------+------------------+----------------------------+-------------------------+---------------------------------------------------------+
| name                     | hash                             | latest_committer | latest_committer_email     | latest_commit_date      | latest_commit_message                                   |
+--------------------------+----------------------------------+------------------+----------------------------+-------------------------+---------------------------------------------------------+
| app-4tqxv/main           | bdrtljhirgg211gm5om392clft7un320 | jiaxue           | jia.xue3@neolink.com       | 2023-05-12 06:41:08.532 | Update page page-a9dug: change transaction detail modal |
| app-4tqxv/release-0.2    | bdrtljhirgg211gm5om392clft7un320 | jiaxue           | jia.xue3@neolink.com       | 2023-05-12 06:41:08.532 | Update page page-a9dug: change transaction detail modal |
| app-4tqxv/user-3tnyl/dev | bdrtljhirgg211gm5om392clft7un320 | jiaxue           | jia.xue3@neolink.com       | 2023-05-12 06:41:08.532 | Update page page-a9dug: change transaction detail modal |
| app-4tqxv/user-5za70/dev | bdrtljhirgg211gm5om392clft7un320 | jiaxue           | jia.xue3@neolink.com       | 2023-05-12 06:41:08.532 | Update page page-a9dug: change transaction detail modal |
+--------------------------+----------------------------------+------------------+----------------------------+-------------------------+---------------------------------------------------------+
```

各分支说明如下：

- `app-4tqxv/main` 分支就是 bc-console 的默认主分支 `main`
- `app-4tqxv/release-0.2` 分支就是 bc-console 的发版分支 `release-0.2`
- `app-4tqxv/user-3tnyl/dev` 分支就是 bc-console 的开发分支 `dev`，不过这个分支仅用户 jiaxue (用户 ID 为 `user-3tnyl`) 可见
- `app-4tqxv/user-5za70/dev` 分支也是 bc-console 的开发分支 `dev`，不过这个分支仅用户 zhangpc (用户 ID 为 `user-5za70`) 可见

> ps: 组件维度的分支跟应用维度的分支是一样的模式，只不过分支命名开头会换成组件 ID，例如组件开发分支的命名规则为 `<组件 ID>/<用户 ID>/分支展示名`。

## 特别说明

- 应用成员的增删改查在 `main` 分支进行，这样统一在 `main` 分支查询用户的应用才能得到预期的结果
