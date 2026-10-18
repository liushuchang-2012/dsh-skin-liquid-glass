# iOS 液态玻璃（iOS Liquid Glass）

DeepSeek Harness Web 客户端的一层 iOS 26 Liquid Glass 皮肤：整个界面是盖在静态柔光雾场上的玻璃：一层薄纱、一块浮起的侧栏玻璃卡片，其余卡片是薄白平涂。

整个窗口只铺一层玻璃：雾场在窗口底层被磨一次，三栏本身透明，左侧栏是一张带真实背景模糊的圆角玻璃卡片，回复卡片与输入卡片各自浮在这层薄片上。强调色只有 iOS 系统蓝，圆角、发丝描边与内高光都按系统控件的比例给；整屏只有一处动效——标题栏上一道 21 秒一圈的镜面高光，在系统开启「减少动态效果」时自动停止。

皮肤本体是声明式资产（`skin.json` + 两份样式表 + 一份雾场定义），同一仓库也能作为 DSH 客户端插件安装。插件形态零依赖、不 require 任何共享模块，只向文档追加三层 `<style>`。

- 皮肤 id：`ios-liquid-glass`
- 插件包名：`dsh-skin-liquid-glass`
- 仓库：<https://github.com/liushuchang-2012/dsh-skin-liquid-glass>
- 许可：MIT

## 截图

| 浅色 | 深色 |
| --- | --- |
| ![浅色模式](preview/light.jpg) | ![深色模式](preview/dark.jpg) |

两张都是 1600×1000 的截图，浅色 / 深色各一，雾场为默认参数。

## 特性

### 五层材质

v0.2.0 起画布是一张静态雾场，照片壁纸不再参与背景。材质分五档，下表取自 `patches.css` 的 `:root` 与 `body[data-ds-dark-theme]`：

| 层级 | 覆盖对象 | 模糊 · 饱和度 | 填充（浅色 / 深色） |
| --- | --- | --- | --- |
| T0 雾场 | 最底层画布：三段柔光池（左上白 .60 / 右上蓝 .32 / 右下冷灰 .34）+ 一条 118° 极淡亮带 + 180° 纵向渐变（`--ios-lg-fog-image`，画在 `body::before`） | 无，固定不滚动 | 浅色 `#ffffff → #f2f7fe → #e1e8f2`（`#e6ecf6` 落在 74%）；深色 `#0b0f15 → #121821 → #1e242e` |
| T1 玻璃 | 整个窗口：一张薄纱，三栏与右栏全部透明 | 40px · 180%，整窗只磨一次 | `--ios-lg-chrome` .22 / .28 |
| T2 侧栏卡片 | 侧栏：全窗唯一一块带真实背景模糊的玻璃卡片 | 28px · 180%（挂在 `::before` 上） | `--ios-lg-sidebar-fill` .10 / .06 |
| T3 内容 | 回复卡片、用户气泡、代码块与表格 | 无——父级已经磨过，卡面不再取一次样 | `--ios-lg-plate` .46 / .46；代码块与表格 `--ios-lg-plate-solid` .58 / .62 |
| T4 控件与浮层 | 输入卡片、菜单、对话框、toast、diff 悬停预览 | 输入卡片径向渐隐；浮层 40px · 180% | `--ios-lg-control-fill` .50→.38 / .46→.38；`--ios-lg-overlay` .58 / .58 |

圆角同样分档：侧栏卡片 24px（四角同值，四周各留 8px 边距），输入卡片 22px，回复卡片 20px（一条回复一张卡，卡内正文不再单独铺底板），对话框 18px，代码块与表格 16px，菜单底板 14px。

工具详情的悬停卡片（`--dsw-hovercard-bg`）不改成浅色：它里面的文字按 shell 的深色底排成白色，浅色底会让标题直接消失。diff 悬停预览是另一种变体（浅底 + 深字），单独在 `patches.css` 里给了实色底。

各层共用一套收边：`--ios-lg-rim` 是一条 `inset 0 1px 0` 的高光内描边（浅色 `rgba(255,255,255,.60)`，深色 `.10`），侧栏玻璃卡单独用更亮的一档 `--ios-lg-rim-card`（浅色 `.70`，深色 `.16`）配 `--ios-lg-edge-card` 底边暗线（浅色 `rgba(0,0,0,.08)`，深色 `.34`），`--ios-lg-edge-dark` 是普通卡片底边的 1px 暗边（浅色 `.06`，深色 `.30`），`--ios-lg-hairline` 是分隔线（浅色 `rgba(60,60,67,.06)`，深色 `rgba(255,255,255,.08)`），投影分 `--ios-lg-shadow`、`--ios-lg-shadow-lift` 两档，侧栏再用更深的 `--ios-lg-shadow-float`（大负扩散 + 近距两段）——大负扩散把边缘压干净，不会在接缝处画出一条暗带。

### 雾场：为什么不再用照片壁纸

照片壁纸会把玻璃拖进一场没有尽头的调参：壁纸最暗的一角压在左栏，同一档白填就会比会话列深出一截；为了盖住照片的纹理，各层只能越加越厚，最后读成「一块白板加几道灰边」。v0.2.0 把背景换成一张静态雾场——浅色从顶部的 `#ffffff` 纵向压到 `#e1e8f2`（`#e6ecf6` 落在 74%），叠三处柔光（左上白光斑 .60、右上淡蓝 .32、右下冷灰 .34）和一条极淡的 118° 亮带；深色从 `#0b0f15` 压到 `#1e242e`，叠两处冷光。全部写成一个 `--ios-lg-fog-image` 单行值，画在 `body::before` 上（`position: fixed`、`pointer-events: none`），不随会话滚动。雾场的明暗跨度是刻意做大的：玻璃后面必须有明暗，薄纱才能读出折射与边缘高光。

玻璃不需要盖住雾，只需要让雾有明暗可读：整窗只铺 .22 的一层薄纱，侧栏再压一块 .10 的真玻璃卡片，其余卡片是 .46–.58 的平涂。雾场的明暗被玻璃放大成层次，这就是「像苹果的材质」而不是「白板」的来源。

遮挡滑杆（`--dsw-skin-scrim`）在 v0.2.0 只作用在 `skin.css` 的 `--dsw-alias-bg-*` 令牌上：设置页、插件市场这类整页会跟着加厚，玻璃材质本身取固定值，避免滑杆一动整窗层次就散。模糊程度同理，由 `patches.css` 的 `--ios-lg-blur-*` 统一定义，不再逐列可调。

### 雾场的两形态一致

两种安装形态画的是同一张雾：皮肤中心形态只能改 `patches.css` 里的规则（写 `html` / `body` 选择器、声明单行，皮肤中心会统一加 scope），插件形态则在 `src/client.template.js` 的 `wallpaperCss()` 里画同一组渐变（`FOG_LIGHT` / `FOG_DARK`）。照片壁纸退出背景，`assets/` 里的两张图与 `skin.json` 的 `contributes.backgroundMedia` 保留为不参与绘制的素材，构建仍走同一套占位符替换。

### 降低透明度回退

`prefers-reduced-transparency: reduce` 下，各层底板（正文、代码块、会话标题栏、输入卡片，以及 Windows 标题条下的整窗薄片）换成 `--dsw-alias-bg-layer-1` 实色并去掉 `backdrop-filter`，输入卡片与气泡换成层 2。`prefers-reduced-motion: reduce` 下那道镜面高光直接停掉（`animation: none`、背景图置空）。两条都是纯 CSS，不需要 JS 参与。

### 插件形态

`package.json` 声明 `dsh.bundle.patch` 与 `dsh.client`。宿主半边 `lib/index.js` 是一个空的 `apply()`，只为了让 cordis 起一个 fiber，客户端 bundle 才有机会进 `window.__DSH_BOOT__`；客户端半边 `client.js` 是构建产物，形如 `window.__ModuleLoader__.load({ id, factory })`，`inject` 为空数组，装载时注入三层 `<style data-plugin-css=…>`（令牌层、材质层、画布层），卸载、热重载、切 profile 时一起摘掉。

## 设计说明

### 两层分工

`skin.css` 是令牌层：只重映射 shell 自己的 `--dsw-*` / `--aion-*` 设计令牌（契约见 `contracts/official-tokens-v1.json`），浅色一套、`body[data-ds-dark-theme]` 一套。需要读作玻璃的表面都写成半透明 `rgba()`；v0.2.0 起玻璃材质的 alpha 取固定值（写死在 `patches.css` 的 `--ios-lg-*`），`--dsw-skin-scrim` 只继续驱动 `--dsw-alias-bg-*` 这类整页底色。

令牌不能携带 `backdrop-filter`，frosting 也躲不开下面那条定位陷阱，所以材质整体放在 `patches.css`：模糊、饱和、高光内描边、圆角、发丝分隔线，以及唯一那处动效。

### 为什么大容器不直接上 backdrop-filter

`backdrop-filter` 与 `filter` / `transform` 一样会让元素成为 containing block。shell 把每个图标的 hover 提示渲染成 action row 与输入卡片内部的 `position: fixed` span；一旦这些盒子带上滤镜，提示就会脱离按钮、飞进滚动区。

所以模糊只挂在没有后代的 `::before` 假层上：窗口底层一次、会话标题栏一次；输入卡片由皮肤中心挂的 `[data-dsh-composer-frost]` 跟随层供霜，`patches.css` 里的 `::before` 只在跟随层缺席时兜底。菜单、对话框、toast 这类浮层本身就是叶子节点，直接带滤镜。

正文、代码块、表格的底板也是 `::before`，但它们的用途是填充、内描边和投影，不是模糊——窗口已经磨过一次，再叠一层只会重复取样。会话里的正文不再逐段铺底板：一条回复是一张 20px 圆角的卡片，卡内文字直接落在卡片上，卡片本身带外圈投影；正文底板只留给会话之外的地方（编辑器预览、文档面板等）。底板的假层用负 inset（`-.18em -.7em`）向外长，文字仍留在 shell 自己的文本列上，圆角不会和第一个字打架。

### 整个窗口只铺一层玻璃

三栏本身是透明的：侧栏作用域里的 `--dsw-specific-sidebar-fill` 被置空、`background` 清掉、`border-right` 归零，会话列与右栏也不再自己铺底色。整窗只有 `[data-dsh-frame]::before` 这一层薄纱（`--ios-lg-chrome` + 40px + 180%），三栏、卡片都浮在它上面，分隔线退成发丝线。

分成三块各自磨的时候，相邻两层取样的位置不同：左栏压在雾场最暗的一角，同样的白填也会差出一截，交界处就出现一道硬台阶；再叠上会话列自己的一块底板，就成了「两块不同的灰」。现在整窗只取一次样，接缝处没有可读的差，会话列也不再是「有自己底色的那一栏」。

侧栏是全窗唯一一块真玻璃：四边各留 8px，24px 圆角，`--ios-lg-sidebar-fill` 的 .10 白纱（深色 6%），上下各一条 1px 的高光与暗边，再带一档大而软的投影。模糊挂在 `::before` 上而不是栏本身：栏里有 `position: fixed` 的浮层，元素自己带 `backdrop-filter` 会变成它们的 containing block，浮层就会飞离按钮。

### 玻璃跟着雾场走

玻璃是半透明的，一栏的色调最终等于它背后的雾。雾是中性灰白，所以玻璃只改明度、不改色相；光斑位置决定了各层取样亮度的落点，换一套雾场参数就要重新调 `--ios-lg-chrome` 与 `--ios-lg-sidebar-fill`。仓库里的取值按上面的三段柔光调好：外壳 .22、侧栏 .10，两者刻意贴着同一档明度，差值再大就会读成两块不同的灰。

浅色这套同时管住文字：11–12px 元数据用的 `--dsw-alias-label-caption` / `label-tertiary` 从 iOS 的 `#8e8e93` 一路压到 `#616167`（雾场上约 5.0–6.2:1），markdown 占位符 `#5f5f65`，toast 另补一行 `--dsw-alias-toast-label: #1c1c1e`——它的底是 .82 白，而 shell 浅色默认的 toast 文字是纯白，不补就是白字白底。深色那块把 caption / tertiary / placeholder 提到 `#a1a1a6`（.46 卡片上约 5.4–6.1:1），并把 `--dsw-alias-toast-label` 显式写回 `#ffffff`：皮肤中心会把浅色令牌克隆到 `body` 上，不写回的话深色 toast 会拿到浅色的 `#1c1c1e`。深色对话框的 `--ios-lg-field` 也从白色改成 `rgba(28, 28, 30, .92)`：白底高光配白字只有 1.15:1，是 v0.1.8 审计里最严重的一处。

浅色令牌块挂在 `:root, body` 两个头上（`skin.css` 的 `/* --- light --- */` 段）：shell 的主题样式把同一批别名声明在 `body` 上，插件形态是原样注入，裸 `:root` 会被 `body` 规则整片盖掉；挂到 body 才能赢，同时保留 `:root` 让 `--aion-*` 这类 html 级别名仍可解析。皮肤中心形态照旧先 scope 再克隆到 body，结果不变；深色块靠 `body[data-ds-dark-theme]` 的特异性继续覆盖。

## 安装

三种方式任选一种。前两种装的是同一份皮肤，不要同时开启：同一套规则会叠两遍，雾场也会画两次。

### 皮肤中心

把仓库内容放进用户皮肤目录，默认位置是：

```
%USERPROFILE%\.dsh\skins\ios-liquid-glass\
```

目录名要与 `skin.json` 的 `id` 一致，皮肤中心扫到就能用，不需要重启：

```powershell
git clone https://github.com/liushuchang-2012/dsh-skin-liquid-glass.git `
  "$env:USERPROFILE\.dsh\skins\ios-liquid-glass"
```

然后在 设置 → 皮肤 → iOS 液态玻璃 里启用。皮肤中心自己调的是 `POST /api/skin-center/v2/active`，body 为 `{"active":"ios-liquid-glass"}`；换回官方默认时 `active` 传 `null`。

### 作为客户端插件

```bash
dsh plugin --profile <name> add <path-or-package>

# 例：从本地 checkout 安装
dsh plugin --profile <name> add "D:\path\to\dsh-skin-liquid-glass"

# 卸载
dsh plugin --profile <name> remove dsh-skin-liquid-glass
```

`<name>` 是目标 profile 名，默认 `web`；`<path-or-package>` 可以是本地绝对路径，也可以是 `github:user/repo` 形式的包说明。装完重载页面生效。插件形态下 `client.js` 自己画雾场，不需要皮肤中心参与。

### 本地开发

```bash
npm run build               # 由 src/client.template.js 生成 client.js
npm test                    # 14 项检查
npm run build -- --check    # 只校验 client.js 与当前源码是否一致
```

改动 `skin.css`、`patches.css`、`assets/` 或 `skin.json` 之后都要重跑 `npm run build`：`client.js` 是构建产物，手改会在下次构建时被覆盖，任何安装方式装的都是构建后的这一份。开发时最省事的验证方式是把本地目录直接 `dsh plugin add` 进去，重建之后再刷新页面。

### 卸载与回退

- 皮肤中心：在 设置 → 皮肤 里换回官方默认，或删掉 `%USERPROFILE%\.dsh\skins\ios-liquid-glass\` 整个目录再刷新页面。
- 插件：`dsh plugin --profile <name> remove dsh-skin-liquid-glass`，然后重载页面。
- 只想临时关掉：把 `localStorage["dsh-skin-liquid-glass.enabled"]` 写成 `"0"`，见「配置」。

## 配置

### 背景遮挡

`--dsw-skin-scrim`（0–1）由皮肤中心的「背景遮挡」滑杆写入。v0.2.0 起它只作用在 `skin.css` 的整页底色（`--dsw-alias-bg-base` / `bg-layer-*`）上，设置页、插件市场这类整页会跟着加厚；玻璃材质（`--ios-lg-*`）取固定值，滑杆不会把整窗的层次拉开。插件形态下没有这个滑杆，变量取 CSS 默认值 0。

气泡另有两个独立旋钮：`--dsh-skin-bubble-alpha`（默认 .5）与 `--dsh-skin-bubble-blur`（默认 10px，v0.2.0 起气泡不再自己上滤镜，只保留 alpha），同样由皮肤中心提供。

### 开关

插件形态的启用状态存在 `localStorage["dsh-skin-liquid-glass.enabled"]`，默认开启，值不是 `"0"` 或 `"false"` 即视为开启。客户端 bundle 导出了 `setEnabled(enabled)` 供程序化调用；页面上更直接的做法是改 localStorage 再刷新：

```js
localStorage.setItem("dsh-skin-liquid-glass.enabled", "0");
```

开关没有走 `dsh-settings`：宿主 apiproxy 只服务白名单内的设置命名空间，第三方命名空间会答 `settings-not-exposed`，所以这个皮肤把状态留在浏览器本地，保持自包含。

### 素材与占位符

`skin.json` 的 `contributes.backgroundMedia.{light,dark}` 与 `assets/` 下的两张照片保留在仓库里，但 v0.2.0 不再把它们画进背景：画布是 `patches.css` 的 `--ios-lg-fog-image`（皮肤中心形态）与 `src/client.template.js` 的 `FOG_LIGHT` / `FOG_DARK`（插件形态）。保留占位符是为了让 `scripts/build.mjs` 的取代表维持不变（7 个占位符，其中两个仍指向 `assets/plugin-wallpaper-*.jpg`），构建产物自洽，想换回照片也不用改构建脚本。

## 兼容性与限制

- **DSH 版本**：`package.json` 没有声明 `engines` 区间；实机验证在 DSH `0.2.0-rc.2` 上完成。
- **平台**：验证在 Windows 上进行。Windows 上 shell 会把聊天列左上角切出一个缺口（`[data-windows-titlebar]` 下自带的那条圆角），皮肤用一条专属规则把这个角压平，全屏右栏的同一个角一并压平。这条规则在其他平台不匹配任何元素，仓库里也没有别的平台专属逻辑。
- **macOS / Linux**：未实测。样式里所有 `backdrop-filter` 都带 `-webkit-` 前缀，`prefers-reduced-transparency` 已覆盖，字体栈优先 `SF Pro Text` / `-apple-system` 再回落到 `Segoe UI`；但没有在真机上校对过渲染结果。
- **不改的东西**：几何与交互。除圆角、外边距、内描边、背景填充和投影外，不动 padding、宽度与滚动结构；选择器要么是 `--dsw-*` 令牌别名，要么是 `[class*="_suffix"]` 匹配，仓库里没有 `hooks.mjs`，也不监听任何 shell 事件。
- **视觉调校跟着雾场走**：雾场是中性灰白的三段柔光，三栏、侧栏卡片、回复卡片与浮层的填充都按它调过。换雾场参数（光斑位置、冷暖、明度）后各层取样亮度会整体偏移，需要重调 `--ios-lg-chrome`、`--ios-lg-sidebar-fill` 与 `--ios-lg-plate`；照片壁纸已不参与绘制，换图不会再影响玻璃。
- **令牌必须单行声明**：`skin.css` / `patches.css` 里每条声明的值都要写在一行内（`linear-gradient`、`radial-gradient`、`box-shadow` 等一律不换行）。皮肤中心不是原样注入样式表，而是把裸 `:root` / `html` 块的令牌按行克隆到 `body` 上；多行值会在克隆时只剩第一行、留下一个没闭合的 `(`，浏览器随后丢弃整张样式表——皮肤就会变回一块没有材质的大白板。`npm test` 里的 CSS 完整性用例会守住这条。

## 验证

`npm test` 跑 `node --test`，17 项，零依赖：

- **bundle 生命周期（7 项）**：只注册一个以包名为 id 的 loader 条目；factory 不 require 共享模块，并导出 `apply` / `setEnabled` / `inject`；`apply()` 铺出三层 `<style>` 且 teardown 全部摘掉；重复 `apply()` 不产生重复图层；`setEnabled(false)` 摘层、写入 `"0"`、下次 `apply()` 仍保持关闭；没有 theme service、没有 `ctx.effect` 也能工作；`client.js` 保持在 400 KB 以内。
- **打包接线（7 项）**：`package.json` 声明 `dsh.bundle.patch` 与 web 客户端且 `inject` 为空；`main`、根导出、`./client` 与 `files` 每一项都真实存在；roster patch 按包名挂载；`client.js` 与构建产物逐字节一致；`skin.json` 声明的两层、两套配色、壁纸与预览图都存在；`screenshots.json` 在 1–8 张之间；两份 README 都写了插件安装路径，`LICENSE` 存在。
- **CSS 完整性（3 项）**：两份样式表的每条声明都在一行内；按皮肤中心的方式把 `:root` / `html` 令牌逐行克隆到 `body` 后，生成的样式表括号仍然平衡；同一份克隆结果喂给 headless Chrome 时能解析出完整规则数（`patches.css` ≥ 40，实测 73；`skin.css` ≥ 4，实测 8），而不是解析失败后只剩 2 条。没装 Chrome 的机器上第三项自动 skip，可用 `CHROME_PATH` 指定浏览器。

`node scripts/build.mjs --check` 单独跑也能确认 `client.js` 没有过期；产物与源码不一致时它以非零码退出，并打印 `client.js is stale — run: npm run build`。

浅色与深色都在 1600×1000 下逐块校对过，`preview/light.jpg` 与 `preview/dark.jpg` 就是那时的校对图。

测试覆盖的是加载契约与打包接线，不覆盖像素级外观：填色、模糊半径、圆角这类结果靠实机目视校对，没有断言。皮肤中心侧的目录扫描与作用域包裹同样不在 `npm test` 范围内，要装上去才看得到。

## 目录结构

| 路径 | 作用 |
| --- | --- |
| `package.json` | 包元数据，以及 `dsh.bundle` / `dsh.client` 声明 |
| `skin.json` | 皮肤清单 v2：id、名称、强调色、预览图、样式表与材质表、素材与 scrim 占位 |
| `skin.css` | 令牌层，重映射 shell 的 `--dsw-*` / `--aion-*` 令牌（浅色 + `body[data-ds-dark-theme]`） |
| `patches.css` | 材质层：雾场、模糊、饱和、高光内描边、圆角、发丝线、唯一那处动效 |
| `assets/ios-liquid-{light,dark}.jpg` | 原尺寸照片素材，2560×1440（v0.2.0 起不参与绘制） |
| `assets/plugin-wallpaper-{light,dark}.jpg` | 1600×900 / q88 压缩版，仍 base64 进 bundle 以满足占位符契约（不绘制） |
| `preview/{light,dark}.jpg` | 皮肤中心卡片与本 README 用的实机截图，1600×1000 |
| `screenshots.json` | 截图清单，相对本目录 |
| `lib/index.js` | 宿主半边：一个空 `apply()`，只负责起 fiber |
| `cordis.patch.yml` | roster patch，把包按自己的名字挂进 profile |
| `src/client.template.js` | 客户端 bundle 模板，含构建期占位符，不直接分发 |
| `scripts/build.mjs` | 零依赖构建器：替换占位符并写出 `client.js`，`--check` 只做比对 |
| `client.js` | 构建产物，`window.__ModuleLoader__.load({ id, factory })` |
| `tests/` | `node:test` 用例：bundle 生命周期、打包接线与 CSS 完整性 |
| `SUBMIT.md` | 发布与投稿说明 |
| `LICENSE` | MIT 正文 |

## 许可

MIT，见 `LICENSE`，版权行为 `ios-liquid-glass contributors`。

设计语言来自 Apple 的 Liquid Glass。仓库内不含第三方代码；背景是 CSS 画的三段柔光雾场，`assets/` 里的照片素材保留但不再参与绘制，预览图截自本皮肤下的 DSH Web 界面。
