---
date: 2025-12-12
author: Hanjie Deng
tags: ["note", "包管理"]
---

# 为什么使用pnpm

使用 npm 时，依赖每次被不同的项目使用，都会重复安装一次（安装到项目中的独立的node_modules中）。 而在使用 pnpm 时，依赖会被存储在`**内容可寻址的存储**`**（**<font style="color:rgb(42, 46, 46);">content-addressable store</font>**）**中，默认是`~/.pnpm-store`

优点

1. 如果你用到了某依赖项的不同版本，只会将不同版本间有差异的文件添加到仓库。 例如，如果某个包有 100 个文件，而它的新版本只改变了其中 1 个文件。那么 `pnpm update` 时只会向存储中额外添加 1 个新文件，而不会因为单个改变克隆整个依赖。
2. 所有文件都会存储在硬盘上的某一位置。 文件会`**硬链接**`到这一位置，而不会占用额外的磁盘空间。 这允许你跨项目地共享同一版本的依赖。
   1. 这是一种缓存机制，yarn也有这种缓存机制，但是是通过复制文件实现的。

这不仅节省了磁盘空间，而且安装速度会很快（reused dependency）

# 安装的三个阶段

- 依赖解析（resolve,fetching）：如果需要的依赖文件不在存储仓库中，则下载到仓库
- 计算node_modules结构
- 硬链接(link)依赖到项目仓库

而且这比传统的三阶段更快

> 传统的三阶段：解析依赖，获取所有依赖，写入所有依赖到项目目录

![image.png](https://obsidian.daydreamer.net.cn/images/20260313144122500.webp)
![image.png](https://obsidian.daydreamer.net.cn/images/20260313144132945.webp)

# 非扁平node_modules

传统的扁平化：使用 npm 或 Yarn Classic 安装依赖项时，所有的包都被提升到模块目录的根目录。 这样就导致了一个问题，源码可以直接访问和修改依赖，而不是作为只读的项目依赖。

而pnpm使用符号链接将项目的直接依赖项添加到模块目录的根目录中

> [扁平化 or 非扁平化？](https://pnpm.io/zh/blog/2020/05/27/flat-node-modules-is-not-the-only-way)
>
> 扁平化结构的问题：
>
> - 模块可访问非依赖的包；（幽灵依赖）
> - 依赖树扁平化算法复杂；
> - 部分包需复制到项目node_modules文件夹中；（磁盘操作耗时）
> - 未解决磁盘空间占用过高的问题。
>
> npm@3之前非扁平化带来的问题
>
> - 依赖过深，路径过长（可能遇到Windows的长路径限制）
> - 多个包重复被复制

pnpm借鉴npm@2的非扁平优点：

- node_modules结构可预测、整洁，每个依赖的node_modules中包含自身依赖

符号链接工作原理

- Node.js 会忽略符号链接、执行真实路径；包的依赖存储在其目录上一级的node_modules中，Node.js 会沿目录结构向上查找依赖，确保包能正常引用所需模块。

例如：

```tsx
node_modules
├─ foo -> .registry.npmjs.org/foo/1.0.0/node_modules/foo
└─ .registry.npmjs.org
   ├─ foo/1.0.0/node_modules
   |  ├─ bar -> ../../bar/2.0.0/node_modules/bar
   |  └─ foo
   |     ├─ index.js
   |     └─ package.json
   └─ bar/2.0.0/node_modules
      └─ bar
         ├─ index.js
         └─ package.json
```

`require('foo')` 会执行 `node_modules/.registry.npmjs.org/foo/1.0.0/node_modules/foo/index.js` 而不是`node_modules/foo/index.js.`，但是在文件路劲表现上，又缩短了直接执行文件的路径长度。

此外，还一定解决了幽灵依赖的问题，因为依赖的依赖不会被提升到node_modules的浅层，只有我们真正需要的依赖才会创建符号链接到`node_modules/`下

实际的依赖一般在`node_modules/.pnpm/`下，保持真正的非扁平依赖结构，结构一般为`.pnpm/<name>@<version>/node_modules/<name>`，而这里的依赖又是链接了全局的可寻址存储的缓存。

需要注意的是，依赖包的依赖和依赖包的实际位置是处于同一级目录的

```tsx
▾ node_modules
  ▸ .pnpm
  ▾ express // 这里并没有node_modules
    ▸ lib
      History.md
      index.js
      LICENSE
      package.json
      Readme.md
  .modules.yaml
```

```tsx
▾ node_modules
  ▾ .pnpm
    ▸ accepts@1.3.5
    ▸ array-flatten@1.1.1
    ...
    ▾ express@4.16.3
      // express的依赖都软链至了node_modules/.pnpm/中的对应目录
      ▾ node_modules
        ▸ accepts
        ▸ array-flatten
        ▸ body-parser
        ▸ content-disposition
        ...
        ▸ etag
        ▾ express // 链接位置
          ▸ lib
            History.md
            index.js
            LICENSE
            package.json
            Readme.md
```

![image.png](https://obsidian.daydreamer.net.cn/images/20260313144144755.webp)

## 补充：对等依赖的情况

假设foo@1.0.0有两个 “对等依赖”，分别是bar@^1和baz@^1（意思是它需要用父级项目里的bar和baz，而且版本得是 1.x 系列）。现在项目里有两个 “父包”：

- 第一个父包foo-parent-1，自己装了bar@1.0.0和baz@1.0.0，然后依赖foo@1.0.0；
- 第二个父包foo-parent-2，自己装了bar@1.0.0但baz@1.1.0，也依赖foo@1.0.0。

这时候foo@1.0.0就尴尬了：跟着第一个父包，得用baz@1.0.0；跟着第二个父包，又得用baz@1.1.0—— 相当于一个人要适配两套不同的 “配件”，正常的 “一套依赖” 肯定不够用。

```tsx
- foo-parent-1
  - bar@1.0.0
  - baz@1.0.0
  - foo@1.0.0
- foo-parent-2
  - bar@1.0.0
  - baz@1.1.0
  - foo@1.0.0
```

对于，没有对等依赖的情况，它应该如下硬链接到其依赖项的符号链接旁边的 node_modules 文件夹：

```tsx
node_modules
└── .pnpm
    ├── foo@1.0.0
    │   └── node_modules
    │       ├── foo
    │       ├── qux   -> ../../qux@1.0.0/node_modules/qux
    │       └── plugh -> ../../plugh@1.0.0/node_modules/plugh
    ├── qux@1.0.0
    ├── plugh@1.0.0
```

pnpm 会给同一个包的不同 “对等依赖组合”，创建不同的文件夹。比如刚才的foo@1.0.0，会生成两个文件夹：

```tsx
node_modules
└── .pnpm
    ├── foo@1.0.0_bar@1.0.0+baz@1.0.0
    │   └── node_modules
    │       ├── foo
    │       ├── bar   -> ../../bar@1.0.0/node_modules/bar
    │       ├── baz   -> ../../baz@1.0.0/node_modules/baz
    │       ├── qux   -> ../../qux@1.0.0/node_modules/qux
    │       └── plugh -> ../../plugh@1.0.0/node_modules/plugh
    ├── foo@1.0.0_bar@1.0.0+baz@1.1.0
    │   └── node_modules
    │       ├── foo
    │       ├── bar   -> ../../bar@1.0.0/node_modules/bar
    │       ├── baz   -> ../../baz@1.1.0/node_modules/baz
    │       ├── qux   -> ../../qux@1.0.0/node_modules/qux
    │       └── plugh -> ../../plugh@1.0.0/node_modules/plugh
    ├── bar@1.0.0
    ├── baz@1.0.0
    ├── baz@1.1.0
    ├── qux@1.0.0
    ├── plugh@1.0.0
```

- 一个叫`foo@1.0.0_bar@1.0.0+baz@1.0.0`：里面的bar目录软链接到bar@1.0.0，baz目录软链接到baz@1.0.0，专门给foo-parent-1用；
- 另一个叫`foo@1.0.0_bar@1.0.0+baz@1.1.0`：里面的bar还是1.0.0，但baz换成了1.1.0的软链接，给foo-parent-2用。

这样一来，虽然看起来foo@1.0.0多了个 “副本”，但其实只是多了个 “链接文件夹”

如果包依赖了含有对等依赖的子包，则它也会受到影响

```tsx
node_modules
└── .pnpm
    ├── a@1.0.0_c@1.0.0
    │   └── node_modules
    │       ├── a
    │       └── b -> ../../b@1.0.0_c@1.0.0/node_modules/b
    ├── a@1.0.0_c@1.1.0
    │   └── node_modules
    │       ├── a
    │       └── b -> ../../b@1.0.0_c@1.1.0/node_modules/b
    ├── b@1.0.0_c@1.0.0
    │   └── node_modules
    │       ├── b
    │       └── c -> ../../c@1.0.0/node_modules/c
    ├── b@1.0.0_c@1.1.0
    │   └── node_modules
    │       ├── b
    │       └── c -> ../../c@1.1.0/node_modules/c
    ├── c@1.0.0
    ├── c@1.1.0
```

# 局限性

- pnpm 忽略 npm 的 package-lock.json 和 npm-shrinkwrapp.json？
  - 核心原因是两者的 node_modules 布局设计逻辑不兼容。npm 的锁文件是为适配其扁平化 node_modules 布局而设计，且 npm 允许同一 name@version 的包多次安装并拥有不同依赖集；而 pnpm默认使用独立的 node_modules 布局，与 npm 锁文件的设计逻辑不匹配，因此无法遵循该格式，只能直接忽略。
  - 若项目原本用 npm 管理，且有 package-lock.json，现在要迁移到 pnpm
    - pnpm import 命令。该命令的作用是将 npm 的锁文件（如 package-lock.json、npm-shrinkwrapp.json）转换为 pnpm 兼容的锁文件格式，从而实现从 npm 到 pnpm 的锁文件平滑迁移，避免因锁文件不兼容导致的依赖安装问题。
- pnpm 10.x 中 node_modules/.bin 下的 Binstubs 是终端文件而非符号链接，这种设计的目的是什么？
  - 目的是解决兼容性问题。pnpm 的 node_modules 采用默认独立布局（非扁平化），部分 “支持插件的 CLI 程序” 可能因路径解析规则变化，无法找到所需插件；将 Binstubs 设计为终端文件，可帮助这类 CLI 程序在 pnpm 的特殊目录结构中正确定位插件，确保其正常运行。

# pnpm link

1. `pnpm link <dir>`

将 `<dir>` 目录中的软件包链接到执行此命令的软件包的 node_modules。

例如，如果你在`~/projects/foo`下，并且执行 `pnpm link ../bar`，那么将在 `foo/node_modules/bar` 中创建指向 bar 的链接。

2. `pnpm link <pkg>`

将指定的软件包 (`<pkg>`) 从全局的 node_modules 链接到执行此命令的软件包的node_modules。

3. `pnpm link`

将执行此命令的位置的包链接到全局 node_modules，这样它可以通过`pnpm link <pkg>` 从另一个包中引用。 此外，如果软件包具有 bin 字段，则软件包的二进制文件将在系统范围内可用。

> 总结就是，不指定名字，就把自己链接到全局，否则就是把其他的命令链接为当前项目可用

# pnpm-lock.yaml

pnpm的依赖锁文件

你应该始终提交锁文件（pnpm 生成的 pnpm-lock.yaml 文件）。 这是出于多种原因，主要是：

- 在 CI 和生产环境中能够更快地完成安装，因为**解析依赖的过程可以被跳过**。
- 开发，测试和生产环境之间强制执行一致的安装和解析方案，这意味着测试和生产中使用的包将与你开发项目时完全相同

# pnpm-workspace.yaml

```yaml
packages:
  - packages/*

# 定义目录和依赖版本号
catalog:
  react: ^18.3.1
  redux: ^5.0.1
```

## packages

工作空间，monorepo常用

## catalogs

将依赖项版本定义为可复用常量。 目录中定义的常量可以在 package.json 文件中引用。

例如刚才的配置

```yaml
{
  "name": "@example/app",
  "dependencies": { "react": "catalog:", "redux": "catalog:" },
}
```

等同于

```yaml
{
  "name": "@example/app",
  "dependencies": { "react": "^18.3.1", "redux": "^5.0.1" },
}
```

**好处**

在工作空间（即 monorepo 或多包 repo）中，许多包使用相同的依赖项是很常见的。 在编写 package.json 文件时，可以减少重复

- 维护唯一版本，易于更新，减少合并冲突

Catalog 协议允许在冒号后使用可选名称 (例如：catalog:name) 来指定应使用哪个目录。 当省略名称时，将使用默认目录。

例如，下面是一种具名目录

```yaml
catalogs:
  # 可以通过 "catalog:react17" 引用
  react17:
    react: ^17.0.2
    react-dom: ^17.0.2

  # 可以通过 "catalog:react18" 引用
  react18:
    react: ^18.2.0
    react-dom: ^18.2.0
```

和`workspace:`协议一样，`catalog:`在发布时也会被替换为正常的依赖版本号

# alias别名

pnpm 别名（Aliases）是一种允许用户用**自定义名称安装软件包**的功能，可在不修改代码引用或项目结构的前提下，灵活替换、管理包版本，解决传统包管理中“版本冲突”“自定义包替换需全局改引用”等问题。

| 核心场景                 | 操作指令示例                                                    | 效果说明                                                                                   |
| ------------------------ | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| 自定义包替换原包         | `pnpm add lodash@npm:awesome-lodash`                            | 用 `awesome-lodash` 替换 `lodash`，代码中 `require('lodash')` 自动指向新包，无需改代码     |
| 同一包安装多个版本       | `pnpm add lodash1@npm:lodash@1` `pnpm add lodash2@npm:lodash@2` | 同时安装 `lodash@1` 和 `lodash@2`，分别通过 `require('lodash1')`/`require('lodash2')` 引用 |
| 全局替换项目中所有目标包 | 编写 `.pnpmfile.cjs` 钩子文件                                   | 自动将项目 `node_modules` 里所有依赖的 `lodash`，替换为 `awesome-lodash`                   |

## 典型使用场景

### 1. 自定义修复包替换原包（无需改代码）

- **场景描述**：项目依赖的 `lodash` 存在 bug，你在分叉库中修复后发布为 `awesome-lodash`，但不想修改项目中所有 `require('lodash')` 引用。
- **解决方式**：用 `lodash` 作为别名安装 `awesome-lodash`，代码引用无需变动，自动指向修复后的包。
- **指令**：`pnpm add lodash@npm:awesome-lodash`

### 2. 同一项目需使用同一包的多个版本

- **场景描述**：项目中某模块依赖 `lodash@1` 的旧特性，另一模块需 `lodash@2` 的新功能，直接升级会导致旧模块报错。
- **解决方式**：给不同版本的 `lodash` 分配自定义别名，分别引用，避免版本冲突。
- **指令**：  
  `pnpm add lodash1@npm:lodash@1`（安装 v1 并命名为 lodash1）  
  `pnpm add lodash2@npm:lodash@2`（安装 v2 并命名为 lodash2）
- **引用方式**：`require('lodash1')`（用 v1）、`require('lodash2')`（用 v2）

### 3. 全局替换项目所有依赖中的目标包

- **场景描述**：不仅项目自身，项目依赖的其他第三方包也引用了有 bug 的 `lodash`，需统一替换为修复后的 `awesome-lodash`，避免“局部替换不彻底”。
- **解决方式**：通过 `.pnpmfile.cjs` 钩子文件，在读取所有包依赖时，自动将 `lodash` 替换为 `awesome-lodash`，实现全局统一替换。
- **关键操作**：创建上述钩子文件，pnpm 安装依赖时会自动执行钩子逻辑。

钩子文件示例（.pnpmfile.cjs）

```javascript
// 作用：读取包依赖时，自动替换指定包
function readPackage(pkg) {
  // 若包有依赖 lodash，将其替换为 awesome-lodash@^1.0.0
  if (pkg.dependencies && pkg.dependencies.lodash) {
    pkg.dependencies.lodash = "npm:awesome-lodash@^1.0.0";
  }
  return pkg;
}

module.exports = {
  hooks: { readPackage }, // 注册钩子
};
```

# 存储配置

```powershell
pnpm config set store-dir /path/to/.pnpm-store
```

# 过滤、排除

可通过 `--filter (或 -F)` 标志指定选择器:

```powershell
pnpm --filter ...foo --filter bar --filter baz...
pnpm --filter=!foo
```
