# iOS 液态玻璃 · iOS Liquid Glass

照 iOS 26 / macOS 的 Liquid Glass 语言给 DSH Web 做的一层皮肤。皮肤部分纯声明式资产，不含 `hooks.mjs`、不跑任何 JS；同一个仓库也以 **DSH 客户端插件**的形式发布（`dsh.bundle.patch` + `client.js`），插件那一半只往文档里塞三个 `<style>` 元素，没有依赖、没有网络请求。

- **皮肤 id**：`ios-liquid-glass`
- **插件包名**：`dsh-skin-liquid-glass`
- **源码仓库**：<https://github.com/liushuchang-2012/dsh-skin-liquid-glass>（MIT）
- **安装位置**：`%USERPROFILE%\.dsh\skins\ios-liquid-glass\`
- **启用方式**：设置 → 皮肤中心 → 「iOS 液态玻璃」，或直接 `POST /api/skin-center/v2/active` 带 `{"active":"ios-liquid-glass"}`

## 安装

**方式一 · 皮肤中心（本机皮肤目录）**：把仓库内容放进 `%USERPROFILE%\.dsh\skins\ios-liquid-glass\`，然后在 设置 → 皮肤中心 里启用。

**方式二 · 当插件装（`dsh plugin`，等价于在 profile 目录里跑 pnpm）**：

```bash
# Git 直装
dsh plugin --profile desktop add github:liushuchang-2012/dsh-skin-liquid-glass

# 或从本地目录装（开发者改完代码直接用这个验证）
dsh plugin --profile desktop add "C:\path\to\dsh-skin-liquid-glass"

# 卸载
dsh plugin --profile desktop remove dsh-skin-liquid-glass
```

装完重载页面即可生效。插件形态下 `client.js` 自己铺壁纸与遮罩，所以**不需要**皮肤中心；反过来也一样，两种方式可以各自单独使用，但不要同时开两层（同一套规则会叠两遍，壁纸也会画两次）。

## 配色：黑白灰 + 系统强调色

整套外壳只有灰阶，唯一有彩度的地方是系统语义色：

| 用途 | 浅色 | 深色 |
| --- | --- | --- |
| 画布/面板/描边 | `#f2f2f7` · `#fff` · `#e8e8ec` · 黑/白低透明描边 | `#000` · 系统灰 1–4 · 白 10–30% 描边 |
| 正文/次级/三级文字 | `#1c1c1e` · `#48484a` · `#8e8e93` | `#f2f2f7` · `#c7c7cc` · `#8e8e93` |
| 交互/链接/聚焦 | `#0a7cff` | `#0a84ff` |
| 成功 / 警告 / 错误 | `#34c759` / `#ff9f0a` / `#ff3b30` | `#30d158` / `#ffd60a` / `#ff453a` |
| 用户气泡 | 白玻璃 + 8% 系统蓝 | 白玻璃 + 15% 系统蓝 |

壁纸（`assets/*.jpg`）是程序生成的**纯中性灰**场（浅色「银灰日光」/ 深色「石墨夜色」），R=G=B，玻璃永远不会染上色偏。想要完全无彩的气泡，把 `patches.css` 里气泡那条 `rgba(10, 124, 255, …)` 换成灰色即可。

## 文件

| 文件 | 作用 |
| --- | --- |
| `skin.json` | 清单 v2：名称、配色、背景图与遮罩、预览图 |
| `skin.css` | **令牌层**：只重映射 shell 自己的 `--dsw-*` / `--aion-*` 设计令牌（浅色一套、`body[data-ds-dark-theme]` 一套） |
| `patches.css` | **材质层**：backdrop blur、高光内描边、圆角、发丝分隔线、唯一那处动效 |
| `assets/ios-liquid-light.jpg` · `assets/ios-liquid-dark.jpg` | 2560×1440 中性灰壁纸 |
| `preview/light.jpg` · `preview/dark.jpg` | 皮肤中心卡片用的预览图（从实机截图生成） |
| `package.json` · `cordis.patch.yml` · `lib/index.js` | 插件宿主半边：roster patch 挂载一个 no-op 的 cordis 插件，客户端 bundle 才有机会进 `window.__DSH_BOOT__` |
| `src/client.template.js` | 客户端 bundle 源码（带占位符，不直接分发） |
| `scripts/build.mjs` | 零依赖打包器：把两份 CSS、两张压缩壁纸、skin.json 里的遮罩拼进 `client.js` |
| `client.js` | **构建产物**：`window.__ModuleLoader__.load({ id, factory })`，只碰 DOM，不 require 任何共享模块 |
| `tests/*.test.mjs` | `npm test`：bundle 生命周期 + 打包接线检查，跑起来不需要任何依赖 |
| `screenshots.json` | 插件市场用的截图清单（指向 `preview/` 两张） |

## 四层材质

| 层 | 对象 | 模糊 / 饱和度 | 填充（背景遮挡 = 0 时） |
| --- | --- | --- | --- |
| T1 外壳 | 侧栏 + 会话区 + 右栏（三栏同一材质） | 30px · saturate 150% | .22（侧栏与聊天同色） |
| T2 内容 | 正文段落/标题/列表、用户气泡、代码块、表格 | 26px（气泡跟随插件滑杆） | .46（标题与正文同色） |
| T3 控件 | 输入卡片（中心 → 边缘渐变，**半透明**）、chip、队列坞 | 30px | **.66 → .50** |
| T4 浮层 | 菜单 / 下拉（回 shell 默认材质）、对话框、提示条 | 40px（菜单默认 blur 40px · saturate 150%） | .95（对话框 / 提示条） |

`--dsw-skin-scrim`（皮肤中心的**背景遮挡**滑杆）驱动每一层填充：遮挡 0 时就是上表的值，遮挡 100 时补到 0.96 左右。输入卡片现在是**半透明**的：中心 .66、边缘 .50，模糊交给皮肤中心挂的 `[data-dsh-composer-frost]` 跟随层（本文件的 `::before` 是兜底），正文从下面滚过时被磨砂压住、不会串字，壁纸也仍然透得出来；外面再套一层模糊光晕（`--ios-lg-halo`）当轮廓。

## 这一版按反馈改了什么

### 第三轮

10. **发送按钮恢复成 iOS 蓝**：shell 的发送键（`.RlGAzG_primary`）填充取的是 `--dsw-alias-button-info-fill`，我之前把它当“灰 chip”用了，所以按钮一直是灰的；现在浅色 `#0a7cff`、深色 `#0a84ff`，禁用态由 shell 自己的 `:disabled{opacity:.4}` 变淡。同一个令牌也给「添加插件」等主按钮上色。
11. **表格/代码框不透明度提上来**：新增 `--ios-lg-plate-solid`（浅色 .84 / 深色 .86），`md-code-block`、`tableScroll`、`tableFill` 的假层从 .64 换到它。
12. **表格卡片左边框贴字的 bug**：shell 的表格单元格是 `padding: 10px 16px 10px 0`，第一列左内边距为 0，所以第一列文字正好顶在我画的左边框上（截图里被圈出来的那条“左边框”）。现在卡片加 `padding: 8px 14px`、首列再加 8px，表格内容从 515 → 529，和左边框之间留出稳定的空隙。

### 第三轮（插件市场兼容）

13. **插件市场 / 设置页不再是“透明纸”**：设置页、市场页整页铺的是 `--dsw-alias-bg-base`，之前是 `.06`（等于全透），所以页面背后的列表会透上来和文字重叠。现在浅色 **.50**、深色 **.54**，市场卡片与设置面板都读得清；同时把中间列自己的背景置空（`background: transparent !important`），避免和外壳假层叠成两层、比侧栏更深。
14. **弹窗里的字不再重叠**：`添加插件` 这类对话框填充 .84 → **.95**（`--ios-lg-overlay`），`dialogBody` 置空（材质统一由外框给），弹窗内的输入框/下拉改成实色 `--ios-lg-field`（浅 .96 / 深 .94）——之前底下的插件列表会从输入框里透出来。
15. **发送按钮恢复成 iOS 蓝**：shell 的发送键（`.RlGAzG_primary`）填充取的是 `--dsw-alias-button-info-fill`，我之前把它当“灰 chip”用了；现在浅色 `#0a7cff`、深色 `#0a84ff`（记录在上一段第 10 条，本轮复验）。

### 第四轮

16. **左上角圆角压平 + 最上层同色**：那个小圆角是 shell 自己画的（`[data-windows-titlebar] .BynINW_centerCol { border-radius: var(--dsh-windows-content-radius) 0 0 0 }`，Windows 专属），它在侧栏和聊天栏交界处切出一个缺口；现在只压平这一处（全屏右栏的同名角落一起），标题条仍用和按钮同一块白玻璃（不用渐变）。实测 `[class*=centerCol] rTL = 0px`（原来 16px）。

### 第五轮（本轮反馈）

17. **左侧栏变成悬浮的大圆角卡片**：`[class*="sidebarCol"]` 加 `margin: 8px 0 8px 8px`、`border-radius: 22px`、`overflow: hidden` 和一层柔和投影，侧栏不再贴着窗口左上角，壁纸从三边露出来，看起来是浮在壁纸上的一块玻璃（深色另给一档投影）。
18. **右侧栏 Markdown 阅读器不再逐段铺模糊**：右栏的 md 预览本身已经挂在右栏的毛玻璃上，每个 `p` / 标题的 `::before` 又各带一层 `backdrop-filter`，长文档滚动时浏览器要逐块重算背板，滚动会一顿一顿的。现在 `[data-document-markdown]`（以及 better-sidebar 的 `editorMd` 预览）里的块级元素不带假层，正文直接落在面板玻璃上，滚动回到普通重绘。
19. **Markdown 标题不再是白色方条**：原来 `[class*="markdown"] > h1…h6` 直接铺 `--ios-lg-plate-strong`（.64），比正文的 .50 更白、而且是方的，压在圆角的假层上就是一条白条。删掉这层填充后标题与正文共用同一块 `.50` 玻璃，圆角从 14px 提到 18px，白度与气泡一致。
20. **所有下拉框 / 菜单回 shell 默认材质**：`--dsw-specific-menu` 回到 `var(--dsw-menu-surface-fill)`（浅 `#f8f9fa94` / 深 `#43454a73`），`--dsw-specific-selector`、`--dsw-alias-bg-overlay`、`--dsw-menu-backdrop-filter`（`blur(40px) saturate(150%)`）全部回默认值——皮肤只负责周围的玻璃，不再改浮层自己的透明度。
21. **输入卡片改为半透明**：`--ios-lg-control-fill` 从近实心的 .96 → .85 改成 **.66 → .50**（`--dsw-skin-scrim` 继续驱动），模糊交给 `[data-dsh-composer-frost]` 跟随层；正文从下面滚过时仍被磨砂压住，但壁纸透得出来。
22. **改动预览（+n −m）看得清了**：`--dsw-alias-file-diff-*` 与 `--dsw-alias-code-diff-*` 回到 shell 的实色（浅 `#e6f4e7` / `#fce6e2`，深 `#1f3124` / `#3c1f1b`），改动行不再半透明；对话里「已编辑 … +12 -3」也不再只在 hover 时上色，静止状态就是绿 / 红。

### 第六轮（参照 Ultronen/dsh-liquid-glass 再调）

23. **侧栏和聊天改成同一块玻璃**：侧栏里 shell 自己那层 `--dsw-specific-sidebar-fill` 才是上一版两块区域颜色不一样的原因——它在共用的 `--ios-lg-chrome` 假层上又叠了一层更暖的白。现在只在 `[class*="sidebarCol"]` 内部把这个令牌置为 `transparent`（Windows 标题条/外框不在此作用域，不受影响），侧栏与聊天栏的取样色差从约 9 级降到 2 级（浅色实测 `sidebar_empty 237 → 226`、`chat_empty 228`）。
24. **投影加大、圆角加到 24px**：`0 26px 64px -22px rgba(0,0,0,.40)` + `0 8px 24px -12px rgba(0,0,0,.22)`（深色 `0 28px 70px … .72`），卡片左侧 8px 缝隙里的取色从 225 掉到 207，能明显看出它浮在壁纸上。
25. **整体更透**：`--ios-lg-chrome` 浅色 .30 → **.22**、深色 .44 → **.34**；正文假层 `--ios-lg-plate` 浅色 .50 → **.46**、深色 .54 → **.48**。三栏、标题条和正文一起变透，壁纸纹理在玻璃后面更清楚，符合液态玻璃的观感；输入卡片和对话框保持各自更高的一档，文字不会串。

### 第二轮

1. **灰阶再浅一档**：`skin.css` 第二轮把浅色边框/分层又降一档（`#f2f2f7` / `#e8e8ec` / 白），外壳基色走 `rgba(253,253,253,…)`，不再是中灰。
2. **输入框更实、四周更透、外轮廓加模糊**：输入卡片改为中心→边缘的渐变填充 **.96 → .85**（`--ios-lg-control-fill`，深色 `rgba(46,46,48,.96) → rgba(30,30,32,.88)`），外面套一圈 `0 0 34px 12px rgba(255,255,255,.44)` 的模糊光晕（`--ios-lg-halo`），硬描边退成 1px 发丝线。
3. **框太小、圆角和字打架**：正文卡片的假层改为**向外扩张**（`inset: -.18em -.7em`）——文字仍留在 shell 自己的文本列上，框却比文字大一圈，左边尤其不再贴字；实测 `scrollWidth == clientWidth`，向外长不会带出横向滚动条。
4. **思考链**：`[data-turn-process]` / `[data-step-process]` 这类整段外层**不做圆角**（改矩形，给它们 padding 会打乱行距），叶子行（`[data-process-activity]`、`[data-disclosure-row]`、`[data-context-injection-body]`…）给 `.4em .68em` 内边距再用负外边距拉回，文字完整落在圆角里。
5. **右栏那条很深的分割线**：根因是三栏材质不同——侧栏自带 shell 的 `--dsw-specific-sidebar-fill`（合成后 ≈.59）、会话区只有两层 wash（≈.15）、右栏 ≈.30，交界处必然是一道台阶，再叠上 shell 的 1px 墨线。现在侧栏自带填充改为透明、**三栏共用同一个 `--ios-lg-chrome` 假层**、会话区 wash 整段删掉、分隔线统一成 `rgba(60,60,67,.09)` 发丝线，窗口是一整块玻璃。

### 第一轮

6. **输入框看得清了**：基线填充 .42 → .84，卡片内 textarea / 输入区不再自绘半透明底。
7. **不再「文字没居中」**：正文卡片删掉 `padding`（`padding: .62em .92em` 会把每段文字从 shell 的文本列上推开）。
8. **不紫了**：128 处带蓝/紫色相的 surface、描边、滚动条、阴影换成灰阶；`--dsw-alias-state-business-primary` 由靛蓝 `#5e5ce6` 改为系统蓝，思考渐变改为中性黑/白，壁纸重画成纯灰（R=G=B）。
9. **接缝**：不再自画 `border-right` / `border-left`（和 shell 的 `.5px` 叠成双线），`::before` 假层用 `border-radius: inherit` 跟随 shell 圆角。

## 两个必须守住的细节

1. **含有 `position: fixed` 后代的盒子不能上 backdrop-filter**。shell 把每个图标的 hover 提示渲染成 action row / 输入卡片内部的 fixed span；一旦这些盒子成了 containing block，提示就会飞到几百像素外或钻进滚动区（皮肤中心 #1724）。所以大容器（侧栏、右栏、标题栏、代码块、表格）的模糊都挂在 `::before` 假层上——假层没有后代，不可能截断任何定位；只有正文段落、用户气泡这类叶子节点才直接加模糊。
2. **不改几何、不碰交互**。除了圆角、内描边和背景填充，不动 padding/宽度/滚动结构；`prefers-reduced-motion` 关掉那一道高光扫过，`prefers-reduced-transparency` 把玻璃降级成实色面板。

## 插件形态（client bundle）

同一个仓库同时是一个 DSH 客户端插件，所以市场里既能当皮肤装、也能 `dsh plugin add`：

- 宿主半边 `lib/index.js` 是空的 `apply()`，只为了让 cordis 起一个 fiber；开关没有走 `dsh-settings`（第三方命名空间对 Web 端会答 `settings-not-exposed`），而是存在 `localStorage["dsh-skin-liquid-glass.enabled"]`，默认开启，也可以在浏览器里调 `setEnabled(false)` 立即收起。
- 客户端半边 `client.js` **不 require 任何模块**（`dsh.client.inject` 为空数组）：所有选择器要么是 `--dsw-*` 令牌别名、要么是 `[class*="_suffix"]`，外壳换 hash 也不会失效。
- 三个 `<style data-plugin-css=…>` 图层：`skin.css`（令牌层）、`patches.css`（材质层）、以及打包时生成的壁纸层（`body` 铺图 + skin.json 里的 scrim，深色走 `body[data-ds-dark-theme]`）。teardown（热重载 / 卸载 / 换 profile）时一起摘掉。
- 壁纸是 1600×900 / q88 的再压缩版（浅色 40 KB、深色 48 KB），base64 之后整包 **169 KB**。

```bash
npm run build                            # 重新生成 client.js（改完 CSS / 壁纸 / skin.json 之后必跑）
npm test                                 # bundle 生命周期 + 打包接线，共 14 项
dsh plugin --profile desktop add "$PWD"  # 本地装一份看效果
```

## 卸载 / 回退

- 换回官方默认：设置 → 皮肤中心 → 官方默认（等价于 `POST /api/skin-center/v2/active` 带 `{"active":null}`）。
- 彻底删除：删掉 `%USERPROFILE%\.dsh\skins\ios-liquid-glass\` 整个目录，刷新页面即可。

## 验证记录（2026-10-13 第二轮）

- `/api/skin-center/v2/catalog`：`origin: "user"`，`warnings: []`。
- `/api/skin-center/v2/skins/ios-liquid-glass/{stylesheet,patches}` → 200，且都被加载器包进 `html[data-dsh-skin="ios-liquid-glass"]` 作用域。
- 实机（headless Chrome + 已认证会话，3200×2000@2x，背景遮挡 = 0）：
  - 三栏假层统一：`[class*="sidebarCol"] x0 w280` / `[class*="centerCol"] x280 w1320` / `[class*="rightbarCol"] x1600 w0` 全部 `plate = rgba(253,253,253,0.3)`，侧栏自带填充已置空（`base = rgba(0,0,0,0)`）。
  - 分隔线：`border-left/right = rgba(60,60,67,0.09)` 发丝线。
  - 正文卡片：假层 `rgba(255,255,255,0.5)` + `blur(26px) saturate(1.5)`，段落元素本身 `bg = transparent`、无 filter（假层向外扩张），`scrollWidth == clientWidth`（无横向溢出）。
  - 输入卡片：渐变填充中心 .96 / 边缘 .85，圆角 22px，光晕 `--ios-lg-halo`。
  - 用户气泡：`blur(10px) saturate(1.5)`（跟随皮肤中心的「气泡模糊」滑杆）。
  - 深色：外壳 `rgba(32,32,34,0.44)`，输入卡片 `rgba(46,46,48,.96) → rgba(30,30,32,.88)`。
  - `--dsw-skin-scrim = 0`，背景层已挂载（`data-dsh-backdrop-active = true`）。
