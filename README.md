# iOS 液态玻璃（iOS Liquid Glass）

DeepSeek Harness Web 客户端的一层 iOS 26 Liquid Glass 皮肤：整个界面是盖在低饱和网格壁纸上的磨砂玻璃。

整个窗口只有一层磨砂：壁纸在窗口底层被磨一次，三栏本身透明，左侧栏、会话底板、回复卡片、输入栏各自浮在这层薄片上——分别是一张平涂的圆角卡片、一层会话自己的底色、一张带外投影的回复卡片、一片更薄的霜。强调色只有 iOS 系统蓝，圆角、发丝描边与内高光都按系统控件的比例给；整屏只有一处动效——标题栏上一道 21 秒一圈的镜面高光，在系统开启「减少动态效果」时自动停止。

皮肤本体是声明式资产（`skin.json` + 两份样式表 + 两张壁纸），同一仓库也能作为 DSH 客户端插件安装。插件形态零依赖、不 require 任何共享模块，只向文档追加三层 `<style>`。

- 皮肤 id：`ios-liquid-glass`
- 插件包名：`dsh-skin-liquid-glass`
- 仓库：<https://github.com/liushuchang-2012/dsh-skin-liquid-glass>
- 许可：MIT

## 截图

| 浅色 | 深色 |
| --- | --- |
| ![浅色模式](preview/light.jpg) | ![深色模式](preview/dark.jpg) |

两张都是 1600×1000 的实机截图，背景遮挡为 0。

## 特性

### 五层材质

材质分五档。下表取自 `patches.css` 的 `:root` 与 `body[data-ds-dark-theme]`，填充值是背景遮挡为 0（壁纸全露）时的 alpha：

| 层级 | 覆盖对象 | 模糊 · 饱和度 | 填充（浅色 / 深色） |
| --- | --- | --- | --- |
| T1 薄片 | 整个窗口：侧栏、会话列、右栏、会话标题栏、Windows 标题条 | 30px · 150%，整窗只做一次 | `--ios-lg-chrome` .20 / .32 |
| T1b 会话底板 | 会话列本身：整条会话线的背景 | 无——平涂在薄片上 | `--ios-lg-pane` .50→.40 / .58→.52（竖向渐变） |
| T2 内容 | 回复卡片、用户气泡、代码块、表格 | 无——平涂，只留内描边与外投影 | `--ios-lg-plate` .46 / .46；代码块与表格 `--ios-lg-plate-solid` .84 / .84；侧栏卡片 `--ios-lg-sidebar-fill` .18 / .07 |
| T3 控件 | 输入卡片、chip、队列坞 | 30px · 150% | `--ios-lg-control-fill` .40→.28 / .42→.30（径向渐变） |
| T4 浮层 | 对话框、toast、菜单、diff 悬停预览、浮动窗口 | 40px · 150% | `--ios-lg-overlay` .94 / .94 |

圆角同样分档：侧栏卡片 24px（四角同值，四周各留 8px 边距），输入卡片 22px，回复卡片 20px（一条回复一张卡，卡内正文不再单独铺底板），对话框 18px，代码块与表格 16px，菜单底板 14px。菜单与下拉框自身的材质交回 shell 默认值，皮肤只负责它们周围的玻璃。

各层共用一套收边：`--ios-lg-rim` 是一条 `inset 0 1px 0` 的高光内描边（浅色 `rgba(255,255,255,.78)`，深色 `.10`），`--ios-lg-hairline` 是分隔线（浅色 `rgba(60,60,67,.06)`，深色 `rgba(255,255,255,.08)`），投影分 `--ios-lg-shadow` 与 `--ios-lg-shadow-lift` 两档，回复卡片与侧栏另用带外圈的一档投影——大负扩散把边缘压干净，不会在接缝处画出一条暗带。

### 壁纸与遮挡

壁纸是两张 2560×1440 的中性灰渐变网格（`assets/ios-liquid-light.jpg` / `assets/ios-liquid-dark.jpg`，R=G=B，三通道均值约 230 / 27），玻璃不会染上色偏，唯一有彩度的位置是系统蓝 `#0a7cff`（深色 `#0a84ff`）。

外壳、会话底板、正文卡片、侧栏卡片与输入卡片的填充都读 `--dsw-skin-scrim`（取值 0–1，皮肤中心的「背景遮挡」滑杆），浮层保持接近实色、不参与这一档。遮挡 0 是设计基准态；推到 1 时外壳 `--ios-lg-chrome` 从 .20 补到 .40（深色 .32→.54），正文 `--ios-lg-plate` 从 .46 补到 .62，输入卡片中心从 .40 补到 .62。三栏、标题栏、正文一起加厚，不会在不同档位上互相错开。

### 降低透明度回退

`prefers-reduced-transparency: reduce` 下，各层底板（正文、代码块、会话标题栏、输入卡片，以及 Windows 标题条下的整窗薄片）换成 `--dsw-alias-bg-layer-1` 实色并去掉 `backdrop-filter`，输入卡片与气泡换成层 2。`prefers-reduced-motion: reduce` 下那道镜面高光直接停掉（`animation: none`、背景图置空）。两条都是纯 CSS，不需要 JS 参与。

### 插件形态

`package.json` 声明 `dsh.bundle.patch` 与 `dsh.client`。宿主半边 `lib/index.js` 是一个空的 `apply()`，只为了让 cordis 起一个 fiber，客户端 bundle 才有机会进 `window.__DSH_BOOT__`；客户端半边 `client.js` 是构建产物，形如 `window.__ModuleLoader__.load({ id, factory })`，`inject` 为空数组，装载时注入三层 `<style data-plugin-css=…>`（令牌层、材质层、壁纸层），卸载、热重载、切 profile 时一起摘掉。

## 设计说明

### 两层分工

`skin.css` 是令牌层：只重映射 shell 自己的 `--dsw-*` / `--aion-*` 设计令牌（契约见 `contracts/official-tokens-v1.json`），浅色一套、`body[data-ds-dark-theme]` 一套。需要读作玻璃的表面都写成半透明 `rgba()`，alpha 由 `--dsw-skin-scrim` 驱动，因此三栏与面板随遮挡一起加厚，而不是各自漂移。

令牌不能携带 `backdrop-filter`，frosting 也躲不开下面那条定位陷阱，所以材质整体放在 `patches.css`：模糊、饱和、高光内描边、圆角、发丝分隔线，以及唯一那处动效。

### 为什么大容器不直接上 backdrop-filter

`backdrop-filter` 与 `filter` / `transform` 一样会让元素成为 containing block。shell 把每个图标的 hover 提示渲染成 action row 与输入卡片内部的 `position: fixed` span；一旦这些盒子带上滤镜，提示就会脱离按钮、飞进滚动区。

所以模糊只挂在没有后代的 `::before` 假层上：窗口底层一次、会话标题栏一次；输入卡片由皮肤中心挂的 `[data-dsh-composer-frost]` 跟随层供霜，`patches.css` 里的 `::before` 只在跟随层缺席时兜底。菜单、对话框、toast 这类浮层本身就是叶子节点，直接带滤镜。

正文、代码块、表格的底板也是 `::before`，但它们的用途是填充、内描边和投影，不是模糊——窗口已经磨过一次，再叠一层只会重复取样。会话里的正文不再逐段铺底板：一条回复是一张 20px 圆角的卡片，卡内文字直接落在卡片上，卡片本身带外圈投影；正文底板只留给会话之外的地方（编辑器预览、文档面板等）。底板的假层用负 inset（`-.18em -.7em`）向外长，文字仍留在 shell 自己的文本列上，圆角不会和第一个字打架。

### 整个窗口磨一次

三栏本身是透明的：侧栏作用域里的 `--dsw-specific-sidebar-fill` 被置空、`background` 清掉、`border-right` 归零，右栏也不再自己铺一层底。壁纸只在窗口底层 `[data-dsh-frame]::before` 上被磨一次（`--ios-lg-chrome` + 30px + 150%），三栏、卡片都浮在这张薄片上，分隔线退成发丝线。

会话列是唯一有自己底色的栏：设置页、插件市场这类「整页」本来就自带背景，而会话直接画在栏上，所以底色给到会话列（`--ios-lg-pane`，纯平涂、不带滤镜）。回复卡片落在这一层底色上，才有「一条回复是一张卡」的层次，而不是一堆卡片直接压在壁纸上。

分成三块各自磨的时候，相邻两层取样的壁纸位置不同：左栏压在壁纸最暗的一角，同样的白填也会差出一截，交界处就出现一道硬台阶。现在窗口只取一次样，接缝处没有可读的差。

侧栏是浮在这张薄片上的平涂卡片：四边各留 8px，露出的是底层薄片，24px 圆角，`--ios-lg-sidebar-fill` 的纯色填充（浅色 .18，深色是一层 7% 的白纱），投影偏左下，不会画到会话列上。它自己不带 `backdrop-filter`，也就没有第二次取样的机会。

### 玻璃跟着壁纸走

玻璃是半透明的，一栏的色调最终等于它背后的壁纸。壁纸是中性灰，所以玻璃只会变动明度、不会变动色相；这也意味着换一张壁纸，各层的取样亮度会整体移动，`--ios-lg-chrome` 与 `--ios-lg-sidebar-fill` 需要跟着重调。仓库里的取值是按自带的两张壁纸调的：外壳与侧栏刻意贴着同一档明度（浅色 .20 对 .18），差值再大就会在窗口里读成两块不同的灰。

## 安装

三种方式任选一种。前两种装的是同一份皮肤，不要同时开启：同一套规则会叠两遍，壁纸也会画两次。

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

`<name>` 是目标 profile 名，默认 `web`；`<path-or-package>` 可以是本地绝对路径，也可以是 `github:user/repo` 形式的包说明。装完重载页面生效。插件形态下 `client.js` 自己铺壁纸与遮罩，不需要皮肤中心参与。

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

`--dsw-skin-scrim`（0–1）是唯一的填充总开关，由皮肤中心的「背景遮挡」滑杆写入。0 是壁纸全露、玻璃最透的一档；1 时面板补实到 .90 以上。插件形态下没有这个滑杆，变量取 CSS 默认值 0，即最透的一档；要固定别的档位，在页面里给 `body` 设同名自定义属性即可。

气泡另有两个独立旋钮：`--dsh-skin-bubble-alpha`（默认 .5）与 `--dsh-skin-bubble-blur`（默认 10px），同样由皮肤中心提供。

### 开关

插件形态的启用状态存在 `localStorage["dsh-skin-liquid-glass.enabled"]`，默认开启，值不是 `"0"` 或 `"false"` 即视为开启。客户端 bundle 导出了 `setEnabled(enabled)` 供程序化调用；页面上更直接的做法是改 localStorage 再刷新：

```js
localStorage.setItem("dsh-skin-liquid-glass.enabled", "0");
```

开关没有走 `dsh-settings`：宿主 apiproxy 只服务白名单内的设置命名空间，第三方命名空间会答 `settings-not-exposed`，所以这个皮肤把状态留在浏览器本地，保持自包含。

### 壁纸与遮罩

壁纸和遮罩写在 `skin.json` 的 `contributes.backgroundMedia.{light,dark}` 里：`src` 指向 `assets/` 下的原图，`scrim` 是一条 `radial-gradient` / `linear-gradient` 列表，叠在壁纸上方。构建时 `scripts/build.mjs` 会把这两项、两份样式表与两张 1600×900 的压缩壁纸一起烘进 `client.js`；皮肤中心形态则直接读 `skin.json`。

## 兼容性与限制

- **DSH 版本**：`package.json` 没有声明 `engines` 区间；实机验证在 DSH `0.2.0-rc.2` 上完成。
- **平台**：验证在 Windows 上进行。Windows 上 shell 会把聊天列左上角切出一个缺口（`[data-windows-titlebar]` 下自带的那条圆角），皮肤用一条专属规则把这个角压平，全屏右栏的同一个角一并压平。这条规则在其他平台不匹配任何元素，仓库里也没有别的平台专属逻辑。
- **macOS / Linux**：未实测。样式里所有 `backdrop-filter` 都带 `-webkit-` 前缀，`prefers-reduced-transparency` 已覆盖，字体栈优先 `SF Pro Text` / `-apple-system` 再回落到 `Segoe UI`；但没有在真机上校对过渲染结果。
- **不改的东西**：几何与交互。除圆角、外边距、内描边、背景填充和投影外，不动 padding、宽度与滚动结构；选择器要么是 `--dsw-*` 令牌别名，要么是 `[class*="_suffix"]` 匹配，仓库里没有 `hooks.mjs`，也不监听任何 shell 事件。
- **视觉调校跟着壁纸走**：自带壁纸是中性灰，三栏、会话底板、回复卡片与气泡的填充都按它调过。换壁纸后各层取样亮度会整体偏移，需要重调 `--ios-lg-chrome`、`--ios-lg-sidebar-fill` 与 `--ios-lg-plate`。

## 验证

`npm test` 跑 `node --test`，14 项，零依赖：

- **bundle 生命周期（7 项）**：只注册一个以包名为 id 的 loader 条目；factory 不 require 共享模块，并导出 `apply` / `setEnabled` / `inject`；`apply()` 铺出三层 `<style>` 且 teardown 全部摘掉；重复 `apply()` 不产生重复图层；`setEnabled(false)` 摘层、写入 `"0"`、下次 `apply()` 仍保持关闭；没有 theme service、没有 `ctx.effect` 也能工作；`client.js` 保持在 400 KB 以内。
- **打包接线（7 项）**：`package.json` 声明 `dsh.bundle.patch` 与 web 客户端且 `inject` 为空；`main`、根导出、`./client` 与 `files` 每一项都真实存在；roster patch 按包名挂载；`client.js` 与构建产物逐字节一致；`skin.json` 声明的两层、两套配色、壁纸与预览图都存在；`screenshots.json` 在 1–8 张之间；两份 README 都写了插件安装路径，`LICENSE` 存在。

`node scripts/build.mjs --check` 单独跑也能确认 `client.js` 没有过期；产物与源码不一致时它以非零码退出，并打印 `client.js is stale — run: npm run build`。

浅色与深色都在 1600×1000 下逐块校对过，`preview/light.jpg` 与 `preview/dark.jpg` 就是那时的校对图。

测试覆盖的是加载契约与打包接线，不覆盖像素级外观：填色、模糊半径、圆角这类结果靠实机目视校对，没有断言。皮肤中心侧的目录扫描与作用域包裹同样不在 `npm test` 范围内，要装上去才看得到。

## 目录结构

| 路径 | 作用 |
| --- | --- |
| `package.json` | 包元数据，以及 `dsh.bundle` / `dsh.client` 声明 |
| `skin.json` | 皮肤清单 v2：id、名称、强调色、预览图、样式表与材质表、壁纸和 scrim |
| `skin.css` | 令牌层，重映射 shell 的 `--dsw-*` / `--aion-*` 令牌（浅色 + `body[data-ds-dark-theme]`） |
| `patches.css` | 材质层：模糊、饱和、高光内描边、圆角、发丝线、唯一那处动效 |
| `assets/ios-liquid-{light,dark}.jpg` | 原尺寸壁纸，2560×1440 |
| `assets/plugin-wallpaper-{light,dark}.jpg` | 1600×900 / q88 压缩版，构建时 base64 进 bundle |
| `preview/{light,dark}.jpg` | 皮肤中心卡片与本 README 用的实机截图，1600×1000 |
| `screenshots.json` | 截图清单，相对本目录 |
| `lib/index.js` | 宿主半边：一个空 `apply()`，只负责起 fiber |
| `cordis.patch.yml` | roster patch，把包按自己的名字挂进 profile |
| `src/client.template.js` | 客户端 bundle 模板，含构建期占位符，不直接分发 |
| `scripts/build.mjs` | 零依赖构建器：替换占位符并写出 `client.js`，`--check` 只做比对 |
| `client.js` | 构建产物，`window.__ModuleLoader__.load({ id, factory })` |
| `tests/` | `node:test` 用例：bundle 生命周期与打包接线 |
| `SUBMIT.md` | 发布与投稿说明 |
| `LICENSE` | MIT 正文 |

## 许可

MIT，见 `LICENSE`，版权行为 `ios-liquid-glass contributors`。

设计语言来自 Apple 的 Liquid Glass。仓库内不含第三方代码；壁纸是中性灰渐变网格图，预览图截自本皮肤下的 DSH Web 界面。
