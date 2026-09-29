# UsagiCard

UsagiCard是「兔兔实验室」（UsagiLab）的用户前端：创建和管理可定制 NFC 卡片，并可绑定多款游戏功能。功能包含卡片设计器、用户账户与订单系统，以及舞萌 DX（国服 / Aqua）、UsagiCard DX / WARS 等多款游戏的数据展示与交互组件。

## 技术栈

- **框架**：Vue 3 + Nuxt 4（SSR，`nitro.preset: 'bun'`）
- **状态管理**：Pinia（`@pinia/nuxt`）
- **样式**：Tailwind CSS v4 + DaisyUI（构建期经 `@tailwindcss/vite`）
- **包管理 / 构建**：bun（`bun.lock`）+ Nuxt（Vite）
- **其他**：ECharts（`vue-echarts`）、zod、qrcode、marked、flexsearch、pinyin-pro、wanakana、@vueuse/nuxt 等

## 目录结构

Nuxt 4 采用 `app/` 作为源码目录：

```
app/
├── components/           # 组件
│   ├── dialog/           # 全局对话框（确认、Q 按钮等）
│   ├── function/         # 游戏功能组件
│   │   ├── maimai-aqua/  # 舞萌 Aqua（国际服 / 私服）
│   │   ├── maimai-cn/    # 舞萌国服（bests / minfo / playdata / query / quick-action / settings）
│   │   └── usagi-card/   # UsagiCard 通用功能（me / settings）
│   └── global/           # 全局组件
│       ├── secondary-pin/
│       └── usagi-card-dx/  # UsagiCard DX 卡片设计器（adaptive-view / assets / sketchpad / widget）
├── pages/                # 文件系统路由页面
│   ├── artifacts/[id]/   # 卡片详情页（functions / settings / sketchpad）
│   ├── embed/            # 嵌入式页面（如 sketchpad 画板）
│   ├── index.vue         # 入口：输入卡片 UUID 跳转
│   └── [...slug].vue     # 兜底路由
├── stores/               # Pinia 全局状态（dialog / notifications）
├── composables/          # 组合式函数（useArtifact / useDesign / useLeporidae / useFunctionManifest 等）
│   └── function/MaimaiCN/  # 舞萌国服相关 composable
├── layouts/  middleware/  plugins/  assets/
└── types/                # 类型定义（api.d.ts / fetch.d.ts 等）
```

> 后端通过 Nitro 的 `/api/**` 代理转发到 Leporidae 后端（见 `nuxt.config.ts` 的 `nitro.routeRules`），不存在本地 `server/api` 目录。

## 路由约定

- `/` — 首页，输入卡片 UUID 跳转
- `/cards/:id` — 等价于 `/artifacts/:id`（在 `nuxt.config.ts` 的 `pages:extend` 钩子中显式注册）
- `/artifacts/:id` — 卡片主视图（按设计类型动态加载 `usagi-card-dx` / `usagi-card-wars` 等设计组件）
- `/artifacts/:id/functions/...` — 卡片功能页（`maimai-cn`、`maimai-aqua`、`usagicard`）
- `/artifacts/:id/settings/...` — 卡片设置页
- `/embed/sketchpad` — 嵌入式画板（供 iframe / WebView 调用）

## 启动

在本目录执行：

```bash
bun install
bun run dev        # http://localhost:3000
```

后端地址通过环境变量 `NUXT_LEPORIDAE_BASE_URL` 注入（默认 `https://api.turou.fun/leporidae`，见 `nuxt.config.ts` 的 `nitro.routeRules`），API 鉴权 Token 通过 `NUXT_LEPORIDAE_DEVELOPER_TOKEN` 注入。

静态资源 / 图片 CDN 地址可在 `runtimeConfig.public` 中调整：

| Key | 默认值 |
| --- | --- |
| `URL` | `http://localhost:3000` |
| `imageURL` | `https://static.turou.fun/leporidae/images` |
| `imagePreviewURL` | `https://static.turou.fun/leporidae/images` |

> 注：开源版本所提供的 NUXT_LEPORIDAE_DEVELOPER_TOKEN 不支持 **机台查询** 等相关接口，其他功能不受影响。

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `bun run dev` | 开发服务器 |
| `bun run build` | 生产构建 |
| `bun run preview` | 预览生产构建 |
| `bun run generate` | 静态站点生成 |
| `bun run lint` / `lint:fix` | ESLint 检查 / 自动修复 |
| `bun run typecheck` | `nuxi typecheck` 类型检查 |

## Docker 与 CI/CD

仓库附带 `Dockerfile`（基于 `oven/bun:1` 多阶段构建）：

```bash
docker build -t usagicard .
docker run -p 3000:3000 usagicard
```

## 开发约定

- 同时考虑桌面端与移动端，响应式设计。
- 避免过多 div 嵌套；可用传统 box/block 处不要过度 flex；少用卡片式布局，避免过度设计与认知负担。
- 不使用 CSS 预处理器，直接用 Tailwind/DaisyUI 类名；仅在 Transition/Animation 时写少量自定义 CSS。
- 全局状态放 `app/stores/`，保持扁平、避免深嵌套。
- 页面组件放 `app/pages/`（文件系统路由），可复用元素放 `app/components/`。
- 使用 SSR，注意水合一致性与重复请求问题。
- TypeScript 严格类型，避免 `any`；类型定义放 `app/types/`。
- 后端 API 调用统一走 `useLeporidae` composable 或 `useNuxtApp().$leporidae`（见 `app/plugins/api.ts`），内部封装了鉴权、错误处理与响应拦截。
