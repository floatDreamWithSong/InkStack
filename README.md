# Inkstack

A simple blog framework built with `Tanstack Start` and `Content Collections`.

- 易于发布：use pre-rendering and static site generation(SSG) to improve the performance and SEO,  able to be deployed on any static file server.

- 渐进式扩展：静态生成优先，但是也能通过tanstack start进一步扩展你的应用：SSR，ISR，等等。

## How to use

clone the repository to your local machine

```bash
git clone https://github.com/your-username/tanstack-markdown-blog.git
```

install dependencies

```bash
pnpm install
```

start the development server

```bash
pnpm dev
```

build for production

```bash
pnpm build
```

preview the production build

```bash
pnpm preview
```

try preview your output with a static file server

```bash
pnpm dlx http-server .output/public
```

try preview your output with server

```bash
pnpm preview
```

## Tech Stack
