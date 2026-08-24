# Leporidae-FE

Leporidae 的用户前端：创建和管理可定制 NFC 卡片，并可绑定多款游戏。功能包含卡片设计器、用户账户与订单系统。

## 技术栈

- **框架**：Vue 3 + Nuxt 4（SSR）
- **状态管理**：Pinia（`@pinia/nuxt`）
- **样式**：Tailwind CSS v4 + DaisyUI（构建期经 `@tailwindcss/vite`）
- **包管理 / 构建**：bun（`bun.lock`）+ Nuxt（Vite）
- **其他**：ECharts（`vue-echarts`）、zod、qrcode、marked、flexsearch 等

## 目录结构

Nuxt 4 采用 `app/` 作为源码目录：

```
app/
├── components/   # 组件
├── pages/        # 文件系统路由页面
├── stores/       # Pinia 全局状态
├── composables/  # 组合式函数
├── layouts/  middleware/  plugins/  assets/
└── types/        # 类型定义
server/
└── api/          # Nuxt 服务端路由（代理/封装后端调用）
shared/
└── types/        # 前后端共享类型
```

## 启动

在本目录执行：

```bash
bun install
bun run dev        # http://localhost:3000
```

后端地址通过环境变量 `NUXT_LEPORIDAE_BASE_URL` 注入（默认 `http://127.0.0.1:8000`，见 `nuxt.config.ts` 的 `runtimeConfig.leporidae`）。

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `bun run dev` | 开发服务器 |
| `bun run build` | 生产构建 |
| `bun run preview` | 预览生产构建 |
| `bun run lint` / `lint:fix` | ESLint 检查 / 自动修复 |
| `bun run typecheck` | `nuxi typecheck` 类型检查 |

## 开发约定

- 同时考虑桌面端与移动端，响应式设计。
- 避免过多 div 嵌套；可用传统 box/block 处不要过度 flex；少用卡片式布局，避免过度设计与认知负担。
- 不使用 CSS 预处理器，直接用 Tailwind/DaisyUI 类名；仅在 Transition/Animation 时写少量自定义 CSS。
- 全局状态放 `app/stores/`，保持扁平、避免深嵌套。
- 页面组件放 `app/pages/`（文件系统路由），可复用元素放 `app/components/`。
- 使用 SSR，注意水合一致性与重复请求问题。
- TypeScript 严格类型，避免 `any`；类型定义放 `app/types/`，前后端共享类型放 `shared/types/`。
