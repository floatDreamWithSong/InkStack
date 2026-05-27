---
date: 2025-12-12
author: Hanjie Deng
tags: ["note", "包管理"]
---

# 不同入口字段（main、exports、module、browser）的对比

在 `package.json` 中，`main`、`exports` 及其他相关字段（如 `module`、`browser`）的核心作用是**定义包的入口文件**，但它们在设计目标、功能灵活性、兼容性和使用场景上存在显著差异。理解这些区别是构建跨环境（Node.js、浏览器、ESM/CJS）兼容的 npm 包的关键，以下从核心定义、功能对比、优先级和最佳实践四个维度展开分析：

## 一、核心字段定义与设计目标

首先明确每个字段的基本用途和最初设计场景，这是理解差异的基础：

| 字段      | 推出时间             | 设计目标                                                                              | 核心特点                                                                |
| --------- | -------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `main`    | npm 早期（2010+）    | 为 **CommonJS (CJS)** 模块系统提供单一入口（Node.js 早期默认模块系统）                | 仅支持单一入口，无环境区分能力，兼容性极强（所有 npm 生态均支持）       |
| `module`  | 2015+（社区推动）    | 为 **ES Module (ESM)** 提供入口，解决 `main`<br/> 仅支持 CJS 的局限                   | 非官方标准（由 Rollup 等工具率先支持），仅用于标识 ESM 入口，无环境区分 |
| `browser` | 2013+（社区推动）    | 为 **浏览器环境** 提供入口，覆盖 `main`<br/> 在浏览器中的兼容性问题（如无 `fs`<br/>） | 支持单一入口或对象映射（替换 Node.js 特定模块），仅作用于浏览器环境     |
| `exports` | 2018+（Node.js 12+） | 官方标准，统一 **多环境、多入口** 配置，支持条件导出（ESM/CJS/ 浏览器 / Node.js）     | 功能最全：支持条件匹配、路径映射、禁止非法导入，是现代包的推荐配置      |

## 二、关键功能对比（核心差异）

从「入口数量」「环境区分」「模块系统支持」等关键维度，可清晰看到各字段的能力边界：

| 对比维度           | `main`                    | `module`                              | `browser`                                                | `exports`                                                                            |
| ------------------ | ------------------------- | ------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| 支持入口数量       | 单一入口（字符串）        | 单一入口（字符串）                    | 单一入口（字符串）或多路径映射（对象）                   | 多入口（对象），支持子路径导出                                                       |
| 环境区分能力       | 无（Node.js/ 浏览器通用） | 无（仅标识 ESM，不区分环境）          | 仅区分「浏览器」vs「非浏览器」                           | 支持细粒度区分（`node`<br/>/`browser`<br/>/`import`<br/>/`require`<br/>）            |
| 模块系统支持       | 仅 CJS（默认）            | 仅 ESM                                | 无限制（需配合 `type`<br/> 字段）                        | 同时支持 ESM（`import`<br/> 条件）和 CJS（`require`<br/> 条件）                      |
| 路径映射与禁止导入 | 不支持                    | 不支持                                | 支持简单路径替换（如 `./fs`<br/> → `./fs-browser`<br/>） | 支持精确路径映射，可禁止未声明的子路径导入（如 `package/subpath`<br/> 必须显式配置） |
| 官方标准性         | 半官方（npm 约定）        | 社区约定（非官方）                    | 社区约定（非官方）                                       | 官方标准（Node.js 12.7+ 支持，npm 认可）                                             |
| 兼容性             | 所有环境（100% 支持）     | 需打包工具（Rollup/Vite）或现代浏览器 | 需打包工具（Webpack/Rollup）支持                         | Node.js 12.7+、现代浏览器、Webpack 5+/Rollup 2+                                      |

### 1. 入口数量与路径控制

- `main`**/**`module`：仅支持单一入口，例如：

```json
{
  "main": "./dist/cjs/index.js", // CJS 入口
  "module": "./dist/esm/index.js" // ESM 入口
}
```

无法直接导出子路径（如 `package/utils`），需用户手动导入具体文件（如 `import utils from 'package/dist/esm/utils'`，非官方推荐）。

- `browser`：支持两种形式：

```json
*   单一入口（字符串）：`"browser": "./dist/browser/index.js"`（浏览器环境替换 `main`）；

*   路径映射（对象）：替换 Node.js 特定模块为浏览器兼容版本，例如：
```

```json
{
  "browser": {
    "./fs.js": "./fs-browser.js", // 浏览器中用 fs-browser 替换 fs
    "path": "path-browserify" // 依赖第三方浏览器兼容包
  }
}
```

- `exports`：支持多入口和子路径导出，例如：

```json
{
  "exports": {
    ".": {
      // 主入口（import 'package' 时匹配）

      "import": "./dist/esm/index.js", // ESM 模块（import 语句触发）

      "require": "./dist/cjs/index.js" // CJS 模块（require 语句触发）
    },

    "./utils": {
      // 子路径入口（import 'package/utils' 时匹配）

      "import": "./dist/esm/utils.js",

      "require": "./dist/cjs/utils.js"
    },

    "./package.json": "./package.json" // 显式导出 package.json（可选）
  }
}
```

优势：用户无需关心内部目录结构，直接导入 `package/utils` 即可，且未声明的子路径（如 `package/private`）会被禁止导入（防止包内部结构暴露）。

### 2. 环境与模块系统适配

- `main`：无环境区分，Node.js 中默认按 CJS 加载，浏览器中需打包工具转换（如 Webpack 将 CJS 转为浏览器可执行代码）。若包仅用于浏览器，直接用 `main` 可能导致兼容性问题（如依赖 Node.js 的 `fs` 模块）。
- `module`：仅用于标识 ESM 入口，由打包工具（如 Rollup）优先读取（比 `main` 优先级高），但不区分环境（浏览器和 Node.js 会共用同一 ESM 入口）。例如：

```json
*   Rollup 打包时，若发现 `module` 字段，会优先加载 ESM 版本，便于 Tree-shaking（ESM 静态分析能力更强）。
```

- `browser`：仅作用于浏览器环境，打包工具（如 Webpack）会用 `browser` 字段替换 `main`。例如：

```json
*   若包同时有 `main: "./dist/node/index.js"` 和 `browser: "./dist/browser/index.js"`，Node.js 中加载 `node/index.js`，浏览器中加载 `browser/index.js`。
```

- `exports`：支持**细粒度条件匹配**，基于「模块系统」（`import`/`require`）和「环境」（`node`/`browser`/`default`），例如：

```json
{
  "exports": {
    ".": {
      "node": {
        // Node.js 环境

        "import": "./dist/node/esm/index.js",

        "require": "./dist/node/cjs/index.js"
      },

      "browser": {
        // 浏览器环境

        "import": "./dist/browser/esm/index.js",

        "require": "./dist/browser/cjs/index.js"
      },

      "default": "./dist/esm/index.js" // 兜底（如未知环境）
    }
  }
}
```

这是 `exports` 最核心的优势：一套配置覆盖所有环境，无需依赖多个字段（`main`/`module`/`browser`）的组合。

## 三、字段优先级（加载顺序）

当多个字段同时存在时，**打包工具和 Node.js 会按特定优先级选择入口**，优先级从高到低如下（以现代工具为例）：

1. `exports`**（条件匹配）**：Node.js 12+ 和 Webpack 5+/Rollup 2+ 优先读取 `exports`，忽略其他字段（除非 `exports` 配置不完整）。
2. `browser`：仅浏览器环境的打包工具（如 Webpack 未开启 Node.js 模拟时）会优先读取 `browser`，其次是 `module`/`main`。
3. `module`：支持 ESM 的打包工具（如 Rollup、Vite）会优先读取 `module`，其次是 `main`。
4. `main`：兜底入口，所有环境均支持，但优先级最低。

### 示例：多字段共存时的加载逻辑

假设 `package.json` 配置如下：

```json
{
  "main": "./dist/cjs/index.js",

  "module": "./dist/esm/index.js",

  "browser": "./dist/browser/index.js",

  "exports": {
    ".": {
      "import": "./dist/esm/index.js",

      "require": "./dist/cjs/index.js"
    }
  }
}
```

- **Node.js 18（ESM 模式，**`import 'package'`**）**：优先匹配 `exports["."].import` → `./dist/esm/index.js`；
- **Node.js 18（CJS 模式，**`require('package')`**）**：优先匹配 `exports["."].require` → `./dist/cjs/index.js`；
- **Webpack 5（浏览器环境，**`import 'package'`**）**：优先匹配 `exports["."].import`，若未配置则读取 `browser` → `./dist/browser/index.js`；
- **Rollup（打包 ESM 包）**：若 `exports` 存在则按其加载，否则优先读取 `module` → `./dist/esm/index.js`；
- **老旧 Node.js（10-，无 \*\***`**exports**` 支持）\*\*：读取 `main` → `./dist/cjs/index.js`。

## 四、最佳实践与场景选择

### 1. 现代 npm 包（推荐 `exports`）

若包需支持 ESM/CJS 双模块系统、多环境（Node.js/ 浏览器）或子路径导出，_\_优先使用 _\_`exports`，理由：

- 官方标准，兼容性持续提升（Node.js 12+ 已支持，现代打包工具全覆盖）；
- 配置集中，无需维护 `main`/`module`/`browser` 多个字段；
- 安全性高，可禁止未声明的子路径导入，避免内部结构暴露。

示例配置（完整双模块 + 多环境支持）：

```json
{
  "type": "module", // 声明包默认是 ESM（可选，若 CJS 为主可省略）

  "exports": {
    ".": {
      "node": {
        "import": "./dist/node/esm/index.js",

        "require": "./dist/node/cjs/index.js"
      },

      "browser": "./dist/browser/esm/index.js", // 浏览器仅 ESM（现代前端推荐）

      "default": "./dist/esm/index.js"
    },

    "./utils": {
      "node": {
        "import": "./dist/node/esm/utils.js",

        "require": "./dist/node/cjs/utils.js"
      },

      "browser": "./dist/browser/esm/utils.js"
    }
  },

  // 兜底字段（兼容无 exports 支持的老旧环境）

  "main": "./dist/node/cjs/index.js",

  "module": "./dist/esm/index.js",

  "browser": "./dist/browser/esm/index.js"
}
```

### 2. 仅支持 CJS（Node.js 后端包）

若包仅用于 Node.js 后端，且无需 ESM 支持，_\_仅需配置 _\_`main`：

```json
{
  "main": "./dist/index.js",

  "type": "commonjs" // 显式声明为 CJS（Node.js 默认，可选）
}
```

### 3. 仅支持浏览器（前端组件库）

若包仅用于浏览器，且需兼容老旧打包工具（如 Webpack 4），可组合 `browser` 和 `module`：

```json
{
  "browser": "./dist/browser/index.js", // 浏览器入口

  "module": "./dist/esm/index.js", // ESM 入口（便于 Tree-shaking）

  "main": "./dist/cjs/index.js" // 兜底（若有 CJS 需求）
}
```

### 4. 避免的误区

- 不要依赖 `module` 字段区分环境：`module` 仅标识 ESM 入口，不区分浏览器和 Node.js，若包内有环境特定代码（如 `window`/`global`），需配合 `browser` 或 `exports`；
- 不要忽略 `main` 作为兜底：即使使用 `exports`，为兼容 Node.js 10- 或老旧打包工具，建议保留 `main` 字段；
- 不要滥用 `browser` 的对象映射：仅在需要替换 Node.js 特定模块（如 `fs`/`path`）时使用，否则优先用 `exports` 的 `browser` 条件。

## 总结

| 场景                            | 推荐字段组合                                  | 核心优势                          |
| ------------------------------- | --------------------------------------------- | --------------------------------- |
| 现代双模块（ESM/CJS）+ 多环境   | `exports`<br/> + （可选）`main`<br/>/`module` | 功能全、官方标准、安全性高        |
| Node.js 后端 CJS 包             | `main`                                        | 简单直观、兼容性强                |
| 浏览器前端包（兼容老旧工具）    | `browser`<br/> + `module`                     | 适配浏览器环境、支持 Tree-shaking |
| 仅 ESM 包（现代前端 / Node.js） | `exports`<br/>（仅 `import`<br/> 条件）       | 简化配置、利用 ESM 静态分析能力   |

随着 Node.js 对 ESM 的全面支持（Node.js 14+ 已稳定）和现代打包工具的普及，`exports` 已成为定义包入口的**最佳实践**，未来会逐步替代 `main`/`module`/`browser` 的组合使用。

（注：文档部分内容可能由 AI 生成）

# exports字段详解

在 package.json 中，exports 字段是 **Node.js 官方定义的标准化配置**，用于精确控制包的入口映射，支持多环境（Node.js/ 浏览器）、多模块系统（ESM/CJS）和子路径导出，同时能禁止未声明的内部路径访问。其语法设计灵活且严谨，以下从 **基础语法**、**核心用法（含场景示例）**、**特殊规则** 三个维度展开详解。

## 一、exports 字段的基础语法

exports 字段的语法分为两种核心形式：**字符串形式（单一入口）** 和 **对象形式（多入口 / 条件匹配）**，后者是其功能核心，支持嵌套条件和路径映射。

### 1. 1 基础结构总览

exports 的顶层值可分为两类，具体结构如下：

| 语法类型   | 适用场景                      | 核心特点                                        |
| ---------- | ----------------------------- | ----------------------------------------------- |
| 字符串形式 | 单一入口（无环境 / 模块区分） | 简洁，仅指定一个入口文件，类似 main             |
| 对象形式   | 多入口 / 条件匹配             | 支持 import/require/node/browser 等条件，可嵌套 |

所有路径均支持 **相对路径**（必须以 ./ 开头，如 ./dist/index.js）或 **绝对路径**（极少用，通常指向包内文件），且最终会解析为包内的实际文件路径。

### 1. 2 字符串形式（单一入口）

当包仅需一个入口（不区分环境 / 模块系统）时，可直接用字符串指定路径，本质是 {"exports": "."} 的简写。

**示例**：

```json
{
  "type": "module", // 声明包默认是 ESM（影响路径解析后的模块类型）
  "exports": "./dist/esm/index.js"
}
```

- 含义：无论通过 import 'package'（ESM）还是 require('package')（CJS，需包支持），均加载 ./dist/esm/index.js；
- 限制：无法区分环境或模块系统，仅适用于简单场景（如纯 ESM 前端组件库）。

### 1. 3 对象形式（多入口 / 条件匹配）

对象形式是 exports 的核心用法，支持 **顶层路径映射** 和 **嵌套条件匹配**，结构可拆解为：

```json
{
  "exports": {
    // 1. 顶层路径：键是「导入路径标识符」，值是「入口配置」
    ".": {
      // 2. 嵌套条件：键是「条件类型」，值是「路径或子条件」
      "node": "./dist/node/index.js", // Node.js 环境
      "browser": "./dist/browser/index.js", // 浏览器环境
      "import": "./dist/esm/index.js", // ESM 模块（import 触发）
      "require": "./dist/cjs/index.js", // CJS 模块（require 触发）
      "default": "./dist/fallback.js" // 兜底条件（所有不匹配时生效）
    },
    // 3. 子路径导出：支持用户通过 `import 'package/utils'` 导入
    "./utils": {
      "import": "./dist/esm/utils.js",
      "require": "./dist/cjs/utils.js"
    },
    // 4. 导出 package.json 自身（可选，允许外部访问包元信息）
    "./package.json": "./package.json"
  }
}
```

#### 关键概念：条件类型（Condition）

exports 对象中，嵌套的键（如 import/node/browser）称为「条件类型」，Node.js 和打包工具（Webpack/Rollup）会按 **优先级顺序匹配条件**，常见条件及优先级如下（从高到低）：

1. **环境相关条件**：node（Node.js 环境）、browser（浏览器环境）、worker（Web Worker 环境）；
2. **模块系统条件**：import（ESM 模块，通过 import/import() 触发）、require（CJS 模块，通过 require 触发）；
3. **兜底条件**：default（所有条件不匹配时生效，必须放在最后，否则会覆盖其他条件）。

<font style="color:rgb(100, 106, 115);">注意：条件的书写顺序不影响匹配优先级（由 Node.js/ 工具内置规则决定），但 default 必须放在最后，否则会被优先匹配导致其他条件失效。</font>

## 二、exports 字段的核心用法（含场景示例）

exports 的核心价值在于 **“精准控制不同场景下的入口”**，以下是 4 个高频实用场景，覆盖绝大多数包开发需求：

### 2. 1 场景 1：区分 ESM 和 CJS 双模块系统

最常见的场景之一：为 ESM（import）和 CJS（require）分别指定入口，解决 “同一包支持两种模块系统” 的需求。

**示例**：

```json
{
  "exports": {
    ".": {
      "import": "./dist/esm/index.js", // ESM 入口：import 'package' 触发
      "require": "./dist/cjs/index.js" // CJS 入口：require('package') 触发
    }
  },
  // 兜底：兼容不支持 exports 的老旧环境（如 Node.js 10-）
  "main": "./dist/cjs/index.js", // CJS 兜底
  "module": "./dist/esm/index.js" // ESM 兜底（供 Rollup 等工具识别）
}
```

- 工作原理：
  - 当用户用 import 'package'（Node.js 14+ 或现代浏览器），匹配 import 条件，加载 ESM 文件；
  - 当用户用 require('package')（Node.js 任何版本），匹配 require 条件，加载 CJS 文件；
  - 若环境不支持 exports（如 Node.js 10），则 fallback 到 main 或 module 字段。

### 2. 2 场景 2：区分 Node.js 和浏览器环境

部分包需在 Node.js（依赖 fs/path 等）和浏览器（依赖 window/document）中提供不同实现，可通过 node 和 browser 条件区分。

**示例**：

```json
{
  "exports": {
    ".": {
      "node": {
        // Node.js 环境下再区分 ESM/CJS
        "import": "./dist/node/esm/index.js",
        "require": "./dist/node/cjs/index.js"
      },
      "browser": {
        // 浏览器环境下区分 ESM/CJS（前端通常以 ESM 为主）
        "import": "./dist/browser/esm/index.js",
        "require": "./dist/browser/cjs/index.js"
      },
      "default": "./dist/esm/index.js" // 兜底（如 Web Worker 环境）
    },
    "./api": {
      "node": "./dist/node/api.js", // Node.js 专属 API（如服务端请求）
      "browser": "./dist/browser/api.js" // 浏览器专属 API（如 fetch 封装）
    }
  }
}
```

- 关键：node 和 browser 是 **环境条件**，可嵌套 import/require 模块条件，实现 “环境 + 模块” 的双重匹配。

### 2. 3 场景 3：子路径导出（暴露包内子模块）

传统方式下，用户需导入包的内部路径（如 import utils from 'package/dist/esm/utils'），依赖包的目录结构；exports 支持 **子路径导出**，让用户通过简洁路径导入（如 import utils from 'package/utils'），且隐藏内部结构。

**示例**：

```json
{
  "exports": {
    ".": "./dist/index.js", // 主入口：import 'package'
    "./utils": "./dist/utils.js", // 子路径 1：import 'package/utils'
    "./hooks": "./dist/hooks/index.js", // 子路径 2：import 'package/hooks'
    "./hooks/useRequest": "./dist/hooks/useRequest.js" // 深层子路径
  }
}
```

- 优势：
  1. 用户无需关心包的内部目录（如 dist 结构），导入路径更简洁；
  2. 未声明的子路径（如 package/private）会被禁止导入，防止包内部代码暴露（安全性提升）。
- 注意：子路径的键必须以 ./ 开头（如 ./utils），否则会被视为无效条件。

### 2. 4 场景 4：禁止未声明的内部路径访问

默认情况下，若不配置 exports，用户可通过 import 'package/src/private.js' 导入包的内部文件（如源码、私有工具函数），可能导致兼容性问题（内部结构变更时用户代码报错）。

exports 会 **自动禁止未声明的路径访问**，仅允许访问 exports 中明确配置的路径。

**示例**：

```json
{
  "exports": {
    ".": "./dist/index.js",
    "./utils": "./dist/utils.js"
  }
}
```

- 效果：
  - 允许访问：import 'package'（匹配 .）、import 'package/utils'（匹配 ./utils）；
  - 禁止访问：import 'package/src/private.js'（未在 exports 中声明），Node.js 会抛出错误：ERR_PACKAGE_PATH_NOT_EXPORTED。

## 三、exports 字段的特殊规则与注意事项

使用 exports 时需遵守 Node.js 定义的特殊规则，否则可能导致配置失效或报错：

### 3. 1 路径必须是相对路径（以 ./ 开头）

exports 中所有文件路径必须是 **相对路径**，且必须以 ./ 开头（绝对路径仅允许指向包外，但几乎无实用场景），否则会被视为无效配置。

- 正确："./dist/index.js"
- 错误："dist/index.js"（缺少 ./）、"/absolute/path/index.js"（绝对路径，不推荐）

### 3. 2 default 条件必须放在最后

default 是兜底条件，必须放在所有其他条件的最后（无论书写顺序，Node.js 会最后匹配它），若放在前面，会覆盖其他条件导致失效。

**错误示例（无效）**：

```json
{
  "exports": {
    ".": {
      "default": "./dist/fallback.js", // 放在前面，会优先匹配，导致 import/require 条件失效
      "import": "./dist/esm/index.js",
      "require": "./dist/cjs/index.js"
    }
  }
}
```

**正确示例**：

```json
{
  "exports": {
    ".": {
      "import": "./dist/esm/index.js",
      "require": "./dist/cjs/index.js",
      "default": "./dist/fallback.js" // 放在最后，仅当其他条件不匹配时生效
    }
  }
}
```

### 3. 3 与 type 字段的配合（影响模块类型）

package.json 中的 type 字段（值为 module 或 commonjs）会决定 exports 路径解析后的 **默认模块类型**：

- 若 type: "module"：exports 指向的 .js 文件默认被视为 ESM（需用 import/export）；
- 若 type: "commonjs"（默认）：exports 指向的 .js 文件默认被视为 CJS（需用 module.exports）。

若需在 type: "module" 中指定 CJS 文件，可通过 **文件扩展名** 显式声明（如 .cjs 后缀）：

```json
{
  "type": "module", // 全局默认 ESM
  "exports": {
    ".": {
      "import": "./dist/esm/index.js", // ESM（.js 后缀，继承 type: module）
      "require": "./dist/cjs/index.cjs" // CJS（.cjs 后缀，显式声明）
    }
  }
}
```

### 3. 4 兼容性处理（支持老旧环境）

exports 是 Node.js 12.7+（稳定版 14+）才支持的特性，若需兼容老旧环境（如 Node.js 10- 或 Webpack 4-），需配合 main/module/browser 字段作为兜底：

```json
{
  "exports": {
    ".": {
      "import": "./dist/esm/index.js",
      "require": "./dist/cjs/index.js"
    }
  },
  "main": "./dist/cjs/index.js", // 兜底 CJS（Node.js 10- 或不支持 exports 的工具）
  "module": "./dist/esm/index.js", // 兜底 ESM（Rollup/Webpack 4 等工具）
  "browser": "./dist/browser/index.js" // 兜底浏览器环境（Webpack 4 等工具）
}
```

- 优先级：支持 exports 的环境会优先使用 exports，不支持的环境会 fallback 到其他字段。

## 四、常见错误与排查方法

使用 exports 时若出现路径匹配失败或模块加载错误，可按以下步骤排查：

1. **检查路径是否以 \*\***./\***\* 开头**：确保所有文件路径均为相对路径（如 ./dist/index.js，而非 dist/index.js）；
2. **验证条件顺序**：确认 default 放在最后，且未覆盖其他条件；
3. **查看模块类型匹配**：若用 require 加载 ESM 文件（或反之），需检查 type 字段和文件后缀（.js/.cjs/.mjs）；
4. **调试工具辅助**：Node.js 中可通过 --trace-warnings flag 查看详细错误（如 node --trace-warnings index.js），定位 ERR_PACKAGE_PATH_NOT_EXPORTED 等错误的原因。

## 五、总结

exports 字段的核心价值是 **“标准化、精细化的入口控制”**，其语法和用法可总结为：

1. **语法灵活**：支持字符串（单一入口）和对象（多入口 / 条件匹配），对象可嵌套环境 / 模块条件；
2. **功能全面**：覆盖 ESM/CJS 区分、Node.js/ 浏览器环境适配、子路径导出、内部路径保护；
3. **最佳实践**：
   - 现代包优先用 object 形式，搭配 import/require/node/browser 条件；
   - 子路径导出需以 ./ 开头，隐藏内部目录结构；
   - 配合 main/module 兜底，兼容老旧环境；
   - 禁止未声明的内部路径访问，提升包的稳定性。

随着 Node.js 对 ESM 的全面支持和现代打包工具的普及，exports 已成为 package.json 中定义入口的 **首选方案**，逐步替代传统的 main/module/browser 组合。
