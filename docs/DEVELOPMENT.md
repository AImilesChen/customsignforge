# 正式工程开发与运行

正式源码目录为website，独立于UI设计原型。采用PRD指定的Astro、Workers、D1和R2。前台从数据库已发布快照服务端渲染，不把整个页面作为HTML字符串插入React。Markdown用React组件渲染并跳过原始HTML。前端手册的组件、SEO、移动端和Workers预览要求适用；其Next.js示例不覆盖本项目PRD技术选型。

## 本地运行

1. `npm ci --legacy-peer-deps`。
2. 首次执行`npm run init:local`生成本地随机密钥，或保留已有.dev.vars并按.dev.vars.example补配置。SESSION_SECRET使用至少32字符随机值；LOCAL_ADMIN_PASSWORD使用随机值。不把该文件发到聊天或提交仓库。
3. `npm run db:migrate`，然后`npm run db:seed`。只操作本地模拟D1；seed使用INSERT OR IGNORE，不覆盖已编辑内容。
4. `npm run dev`，打开http://localhost:4321/和/admin/。
5. 本机入口在登录页展开“本机开发入口”，使用.dev.vars中的本机管理员密码。只在本机且开发配置开启时生效。
6. `npm test`运行数据与权限测试；`npm run check`检查项目；`npm run build`和`npm run preview`验证Workers构建产物。

`.wrangler`内为本地模拟数据库和图片，不能清理后仍期待保留数据。正式Cloudflare资源尚未创建，wrangler里的数据库ID只是本地占位，不可直接拿去正式部署。

## 后台使用

- 产品与页面：新增产品/作品、编辑Markdown、关联主图、SEO和排序。保存草稿与发布分开；已发布页面有新草稿时仍展示旧发布快照。发布后下一次页面请求读取新版本。下架时阻止破坏仍被已发布作品引用的产品。
- 询价：按编号、记录状态、阶段、来源及款式筛选。只有业务人员人工确认才标记实际联系；标记成交必须有联系确认、金额与币种。并发修改通过version阻止覆盖，历史有独立跟进日志。
- 图片：仅管理员，JPEG/PNG/WebP，最大8MB；要求替代文字和来源备注。不被已发布内容引用的R2图片不公开。访客不上传图纸。
- 全站设置：品牌公开介绍、业务邮箱、WhatsApp和FAQ。联系方式可以留空，不自动生成假地址。经营者私人信息不在此处录入。

## Google与邮箱登录

仅指定ADMIN_EMAILS允许后台登录，访客不注册。两种登录配置互相独立：

- Google：创建OAuth Web客户端，设置回调`https://customsignforge.com/auth/google/callback`，在Worker secrets配置GOOGLE_CLIENT_ID、GOOGLE_CLIENT_SECRET、SESSION_SECRET；AUTH_ORIGIN固定为实际后台所在的HTTPS源。使用openid/email最小范围，状态、nonce、PKCE、令牌签名/issuer/audience/邮箱验证均校验。拒绝未列入ADMIN_EMAILS的账号。
- 邮箱：8位一次性验证码，10分钟有效，最多5次尝试，绑定发起浏览器，并限制发送与验证频率。发送适配器当前使用Resend API；MAIL_API_KEY和MAIL_FROM未配置时入口禁用，不伪装邮件已发送。需要邮件服务账号和发送域验证后才能端到端联调；可以另行替换邮件适配器。
- 两种方式成功后建立服务端可撤销会话，HttpOnly Cookie。退出删除服务端会话。生产HTTPS启用Secure；后台写请求另校验同源和CSRF。
- 本机密码是开发辅助入口，不是正式的第三种用户登录方式。生产/非本机请求不能启用它。

参考官方资料：[Google OIDC](https://developers.google.com/identity/openid-connect/openid-connect)、[邮件发送接口](https://resend.com/docs/api-reference/emails/send-email)、[Astro Workers适配器](https://docs.astro.build/en/guides/integrations-guide/cloudflare/)、[D1本地迁移](https://developers.cloudflare.com/d1/reference/migrations/)。未配置真实账号前，不声称Google回调或真实邮件投递已验收。

## 询价与来源

服务端枚举/长度检查、蜜罐、限流、幂等键、D1保存和随机咨询编号。重试同一请求返回同一编号，修改内容后必须新建提交。WhatsApp预填只包含款式、场景、国家、阶段和引用编号，不附带自由文本。打开聊天不代表发送，站内记录初始为web_recorded。

只有有效号码配置后才提供WhatsApp链接；邮箱同样需要真实开通后填写。来源仅取当前URL白名单UTM和不含查询的内部路径，不读取完整外部referrer，不额外写入跟踪Cookie，也不加载广告统计脚本。未知来源显示未知。上线Turnstile验证必须配齐站点/服务端密钥，无法验证则拒绝提交；本地模拟环境单独放行。

## 上线前仍需完成

真实CF数据库/R2/域名绑定与管理员邮箱白名单、Google/邮件服务、Turnstile、业务邮箱和WhatsApp、经营/法律事项及政策审阅、实际目标地区和内置浏览器测试、备份和恢复演练。PUBLISH_READY默认未启用，预览禁止索引。没有公开部署，也不把本地测试当作上线验收。


## 本次运行记录（2026-10-18）

已通过7项自动化测试、9项真实本地Workers/D1流程检查、21个公开页面和11个图片资源巡检。桌面与手机页面有浏览器截图，保存在docs/evidence。Google令牌验证及真实邮件投递待账号配置，当前只有模拟发送和拒绝伪造回调测试。

`npm run preview`直接使用Wrangler加载Astro生成的dist/server/wrangler.json，并复用本地.wrangler/state。原生Astro preview代理在本机重放退出会话时出现fetch failed，直接Wrangler运行同一构建产物通过检查。保留preview:astro供后续版本排查，不作为本次验收入口。修改后重新build前先停止预览，避免Windows锁住dist目录。dist包含开发构建拷贝的.dev.vars，不上传或打包dist；正式构建使用独立安全环境与Worker secrets。
