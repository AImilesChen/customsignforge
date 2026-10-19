# 产品详情页 V2 本地交接（2026-10-19）

用户已确认背发光字桌面/手机配套样板，本轮完成六类产品详情页的代码实现。本地预览：http://localhost:4326/products/backlit-letters/ 。本轮未提交、推送或部署；正式站仍为上次版本。

| 类别 | 路由 | 内容组织 |
|---|---|---|
| 背发光字 | /products/backlit-letters/ | NOVA代表效果、场景+表面/侧边细节、四项定制、办公室/酒店概念场景 |
| 正面发光字 | /products/led-channel-letters/ | 店面效果、字面/照明布局参考、定制、商业场景 |
| 金属立体字 | /products/metal-letters/ | 材质和自然阴影、成型/边缘参考、表面/固定说明 |
| 亚克力字 | /products/acrylic-letters/ | 色彩和层次、非发光边缘/叠层参考、色板/定制 |
| 灯箱及线形发光 | /products/lightbox-neon/ | 双效果首图，灯箱/线形两方向及各自询价入口 |
| 特殊定制 | /products/specialty-signs/ | 灯泡字/外露灯源两方向，参考评估及范围确认 |

通用流程包含四项定制说明、三步开始提示、产品专属FAQ、收尾询价。手机先标题/图片再简介，图片可放大、FAQ原生展开；询价仍需客户登录，所选款式与子方向保留。未增加后台身份权限、数据库迁移或新的外部服务。

## 内容维护

- 展示结构、短文案、图片和FAQ：src/data/product-pages.json。
- 布局与交互：src/components/pages/ProductPage.jsx；样式src/styles/product-page.css。
- 已有后台产品正文、简介和未展示图库仍在More Product Information中；后台明确替换的主图继续优先。新建未知slug保留通用回退页面。
- 新板块目前由仓库JSON维护，未虚构成后台已有完整可视化编辑能力。
- 子方向经Quote.jsx写入可编辑备注；客户仍可修改，服务端保持原有验证。

## 图片交接与验收

13张独立生成图片、39张响应式WebP已编码；原图约2.4MiB合计，不等于单次页面下载量。来源、尺寸和SHA见product-v2-assets.json。AI照片为外观概念，供应商照片明确标为参考，未作为实际工程或生产合格证明。

29项自动测试通过；64文件类型检查0错误/警告/提示；生产构建与输出敏感值扫描通过。六页和130个图片资源200。浏览器检查桌面1440、手机390/360、平板768无横向溢出；放大、关闭/焦点、FAQ及询价登录返回路径通过。四个子方向使用真实Quote组件做本地SSR初始化断言通过。未发送验证码、邮件或WhatsApp、未提交客户测试询价。

实际浏览器截图、同画布样板对照、修正历史和限制见 ../design-qa.md 及本地docs/evidence/products-v2/。最终视觉验收 final result: passed。生成工具的近似字体/画面与真实HTML有合理差别；全站原有真实收信、WhatsApp实际收件和政策等待办未在此轮记为完成。
