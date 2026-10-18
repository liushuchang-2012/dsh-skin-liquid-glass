# iOS 液态玻璃（iOS Liquid Glass）

给 DeepSeek Harness 的液态玻璃皮肤：一层自绘的静态雾场铺在最底下，整窗只磨一次，三栏都透明叠在上面——所以左边栏和对话区永远是同一个背景。

![浅色](preview/light.jpg)

## 特性

- **一个背景**：顶部纯白、中段转灰、底部一抹淡蓝（`#4d6bfe`），整窗共用，左右不会出现色差。
- **一层磨砂**：`[data-dsh-frame]::before` 上一次 `blur(40px) saturate(160%)`，玻璃质感来自这一层，而不是更白的底色。
- **悬浮侧栏**：24px 圆角、22% 白纱、`blur(40px)`、细描边与投影；卡片本身几乎透明，透出背后的光。
- **气泡与景深**：一条回复一张气泡（18px 圆角、轻投影），你发的消息带向上投影，两者都压在底部蓝色之上。
- **克制的实心表面**：代码块、输入框、菜单/弹窗/toast 是仅有的几处实心面，保证可读性。
- **浅深两套**：跟随 `body[data-ds-dark-theme]` 自动切换，不需要 JavaScript 监听。

## 安装

### 皮肤中心

把仓库作为皮肤目录安装，或复制到 `~/.dsh/skins/ios-liquid-glass`，然后在皮肤中心启用。

### 作为客户端插件

```bash
dsh plugin add github:liushuchang-2012/dsh-skin-liquid-glass
npm install github:liushuchang-2012/dsh-skin-liquid-glass   # 也可以走 npm
npm uninstall dsh-skin-liquid-glass                          # 卸载
```

### 本地开发

```bash
node scripts/build.mjs            # 重新生成 client.js
node scripts/build.mjs --check    # CI：client.js 是否过期
node --test tests/*.test.mjs      # 17 项校验
```

## 配置

- **背景遮挡**：皮肤中心里的滑杆，0 时最透，100 时面板补到近实底。
- **开关**：`localStorage["dsh-skin-liquid-glass.enabled"] = "0" | "1"`，或插件导出的 `setEnabled(bool)`。

## 兼容性与限制

- 只在 Windows 桌面端实测；macOS / Linux 未测试。
- 皮肤靠 `[class*="_suffix"]` 与 CSS 变量匹配，shell 改类名时可能要跟着改。
- CSS 在应用启动时加载，改完要重启 DSH 才生效。

## 验证

`node --test tests/*.test.mjs` 共 17 项：构建产物与模板一致、两份样式表每个声明单行（皮肤中心按行克隆，换行会截断样式）、模拟克隆后 Chrome 仍能解析、manifest 与发布文件清单正确。

## 目录结构

```
skin.css      令牌层（颜色、圆角、字体）
patches.css   材质层（背景、磨砂、侧栏、气泡、浮层）
src/          client.js 模板
scripts/      build.mjs
tests/        17 项校验
preview/      截图
```

## 许可

MIT
