# Custom Sign Forge · 正式开发工程

Astro + React，运行在 Cloudflare Workers；D1 保存内容和询价，R2 保存后台上传图片。

```powershell
npm ci --legacy-peer-deps
npm run init:local
npm run db:migrate
npm run db:seed
npm run build
npm run preview
```

网站：[本地预览](http://localhost:4321/)；后台：[管理后台](http://localhost:4321/admin/)。

本机管理员密码在 `.dev.vars`，仅本地开发可用。Google 与邮箱验证码需要配置后才能真实使用。访客询价无需登录。

开发热更新使用 `npm run dev`；运行构建产物使用 `npm run preview`。切换前停止占用 4321 端口的进程。

操作说明见 [开发说明](docs/DEVELOPMENT.md)，阶段结果见 [开发报告](docs/IMPLEMENTATION-REPORT.md)。

此工程尚未对外部署。禁止将 `.dev.vars`、`.wrangler`、`dist`、缓存或本地数据库上传到公开仓库。正式上线仍须完成 Cloudflare 资源、账号与联系方式接入、政策审核和上线验收。
