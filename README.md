<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# luminolsuki.moe

[LuminolMC](https://luminolsuki.moe) 官方网站，基于 Next.js + Vite 构建。

> Why not try Kotlin?

## 简介

本仓库为 LuminolMC 项目组的官方展示站点，涵盖项目介绍、版本下载导引、文档入口及社区链接等内容。LuminolMC 专注于推进 Folia 生态，旗下核心项目包括：

- **[Luminol](https://github.com/LuminolMC/Luminol)** — 轻量、优化、功能完整的 Folia 分支，适用于生存与无政府服务器
- **[Lophine](https://github.com/LuminolMC/Lophine)** — Luminol的下游分支，旨在 Folia 上实现更多生电的内容以及更多的功能
- **[LightingLuminol](https://github.com/LuminolMC/LightingLuminol)** — Luminol 分支，目标是在 Folia 上兼容运行更多 Bukkit 插件

## 技术栈

- **框架**：[Next.js](https://nextjs.org/)
- **构建工具**：[Vite](https://vitejs.dev/)
- **运行时**：Node.js 18+

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看本地预览。

## 部署

看起来这个仓库的部署工作由Cloudflare Pages代理并执行，很酷。

**静态导出**

若需纯静态托管，可在 `next.config.js` 中启用 `output: 'export'`，执行：

```bash
npm run build
# 产物位于 out/ 目录
```

**自托管**

```bash
npm run build
npm run start
```

## 贡献

欢迎提交 Issue 或 Pull Request。提交前请确保已经在本地通过构建测试。

## License

[GPL-3.0 license](./LICENSE)
