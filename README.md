# iOS 液态玻璃 · iOS Liquid Glass

照 iOS 26 / macOS 的 Liquid Glass 语言给 DSH Web 做的一层皮肤。纯声明式资产目录，不含 `hooks.mjs`、不跑任何 JS，因此可以在用户皮肤目录里手工安装并随时删掉。

- **皮肤 id**：`ios-liquid-glass`
- **源码仓库**：<https://github.com/liushuchang-2012/dsh-skin-liquid-glass>（MIT）
- **安装位置**：`%USERPROFILE%\.dsh\skins\ios-liquid-glass\`
- **启用方式**：设置 → 皮肤中心 → 「iOS 液态玻璃」，或直接 `POST /api/skin-center/v2/active` 带 `{"active":"ios-liquid-glass"}`

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

## 四层材质

| 层 | 对象 | 模糊 / 饱和度 | 填充（背景遮挡 = 0 时） |
| --- | --- | --- | --- |
| T1 外壳 | 侧栏 + 会话区 + 右栏（三栏同一材质） | 30px · saturate 150% | .30 |
| T2 内容 | 正文段落/标题/列表、用户气泡、代码块、表格 | 26px（气泡跟随插件滑杆） | .50 / .64 |
| T3 控件 | 输入卡片（中心 → 边缘渐变）、chip、队列坞 | 30px | **.96 → .85** |
| T4 浮层 | 菜单、对话框、提示条 | 40px | .95 |

`--dsw-skin-scrim`（皮肤中心的**背景遮挡**滑杆）驱动每一层填充：遮挡 0 时就是上表的值，遮挡 100 时补到 0.96 左右。输入卡片中心在遮挡 0 时也有 .96，所以正文从它下面滚过时不会串字；四周 0.85 比中心更透，外面再套一层模糊光晕（`--ios-lg-halo`）当轮廓。

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
