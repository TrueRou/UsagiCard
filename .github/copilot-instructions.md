This document provides a comprehensive overview of the Bunny project, its technical stack, and development conventions to be used as instructional context for future interactions.

## Project Overview

Bunny is a frontend application for creating and managing customizable NFC cards that can be linked with various games.

### Frontend

The frontend is a Vue.js application with Nuxt 3, utilizing Pinia for state management and Tailwind CSS for styling. It features a card designer, user account management, and an order system.

- **Framework:** Vue.js 3 + Nuxt 3
- **State Management:** Pinia
- **Styling:** Tailwind CSS + DaisyUI
- **Build Tool:** Vite
- **UI Components:** The application mainly uses DaisyUI components for a consistent look and feel.

## Building and Running

### Frontend

To run the frontend development server:

1.  Navigate to the `web` directory:
    ```bash
    cd web
    ```
2.  Install dependencies (using pnpm, as indicated by `pnpm-lock.yaml`):
    ```bash
    pnpm install
    ```
3.  Run the development server:
    ```bash
    pnpm dev
    ```
    The frontend will be available at `http://localhost:3000` by default.

## Development Conventions

- **Frontend:** The frontend is structured with a clear separation of concerns, with components, pages, stores (Pinia), and common utilities in their respective directories.
- **Styling:** Utility-first CSS with Tailwind CSS is the standard for styling.

Also, the project matainers own their personal styles and conventions, we will mention them as Chinese:

### conventions

- Bunny 同时考虑桌面端和移动端的用户体验，采用响应式设计，确保在不同设备上都有良好的显示效果。

- 请尽量避免创建过多的 div 嵌套，在可以使用传统 box、block 的地方不要过度使用 flex 布局，尽量少的使用卡片式布局，避免过度设计，避免用户的认知负担。

- Bunny 尽量不使用 CSS 预处理器，直接使用 Tailwind CSS 和 DaisyUI 提供的类名来进行样式设计，一般来说只在设计 Transition 和 Animation 时会使用少量的自定义 CSS。

- Bunny 使用 Pinia 进行状态管理，所有的全局状态都应该放在 `stores` 目录下，并且尽量保持状态的扁平化，避免嵌套过深。

- Bunny 使用 Nuxt 3 的文件系统路由功能，所有的页面组件都应该放在 `pages` 目录下，组件化的页面元素放在 `components` 目录下。

- Bunny 使用 SSR，请考虑到服务端渲染的特性，避免出现水合错误，以及多次请求等问题。

- Bunny 使用 TypeScript 进行类型检查，所有的组件和模块都应该有明确的类型定义，避免使用 `any` 类型，类型定义文件放在 `types/def` 目录下。

- 由于 Bunny 使用了国际化（i18n），所有的文本内容请放在对应 vue 文件的 `<i18n>` 块中，避免硬编码文本，使用 t 函数进行文本的引用，在生成代码时，请你也生成对应的 en 与 zh_CN 翻译。

- Bunny 使用了 SpringBoot 作为后端框架，如果提供了 openapi.json 文件，请你参考该文件生成调用，并且正确且完整的处理请求和响应的类型。
