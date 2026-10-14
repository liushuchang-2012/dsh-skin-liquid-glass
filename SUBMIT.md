# 安装 / 收录说明（SUBMIT）

## 1. 本地安装（已装好的话跳过）

把仓库（就是本目录本身）放进用户皮肤目录：

```
%USERPROFILE%\.dsh\skins\ios-liquid-glass\
```

仓库里的文件就是皮肤文件，所以克隆到 `.dsh\skins\` 下、并保证目录名是
`ios-liquid-glass` 即可；也可以手工复制本目录里的文件过去。

```powershell
git clone https://github.com/liushuchang-2012/dsh-skin-liquid-glass.git `
  "$env:USERPROFILE\.dsh\skins\ios-liquid-glass"
```

然后 **刷新页面 → 设置 → 皮肤 → iOS 液态玻璃**（或
`POST /api/skin-center/v2/active`，body 为 `{"active":"ios-liquid-glass"}`）。
皮肤中心**不需要重启**：目录被扫描到就能用。

## 2. 仓库（已发布）

源码仓库：<https://github.com/liushuchang-2012/dsh-skin-liquid-glass> —— 公开、MIT、
根目录直接就是皮肤文件（`skin.json` / `skin.css` / `patches.css` / `assets/` /
`preview/` + `README.md` / `README.en.md` / `LICENSE`），因此本目录可以当工作区直接改。

本机工具链（2026-10-15 已装好，都在机器上，不依赖 PATH 里的旧进程）：

| 工具 | 位置 | 状态 |
| --- | --- | --- |
| git | `C:\Program Files\Git\cmd\git.exe`（2.55.0） | 全局身份已设为 `liushuchang-2012 <179297590+liushuchang-2012@users.noreply.github.com>` |
| gh | `C:\Program Files\GitHub CLI\gh.exe`（2.102.0，winget 装机） | 已登录 `liushuchang-2012`（scopes: repo / read:org / gist），`gh auth setup-git` 已注册全局 credential helper |

发布流程（就是本目录）：

```powershell
cd <本目录>
git add -A
git commit -m "docs: ..."
git push
```

## 3. 申请收录

皮肤由皮肤中心的市场目录分发（`https://dsh-market.com/manifest/skins.json`，
市场侧的目录来源是 dsh-web 仓库的 `skins/` 目录）。两条路都可以走：

- **应用内**：设置 → **插件市场** → 右上角 **「申请收录插件 ↗」**，填写仓库地址，
  并在说明里写明这是一个**皮肤中心皮肤（skin-center skin）**：纯声明式、无
  `hooks.mjs`、无依赖、放进 `$DSH_HOME/skins/<id>/` 即生效。
- **仓库侧**：如果市场方要求以仓库目录形式收录，把本目录整体作为
  `skins/ios-liquid-glass/` 提交到 dsh-web 仓库的 PR。

申请时建议附上：

| 项目 | 值 |
| --- | --- |
| id | `ios-liquid-glass` |
| 仓库 | <https://github.com/liushuchang-2012/dsh-skin-liquid-glass> |
| 作者 | `liushuchang-2012` |
| 名称 | iOS 液态玻璃 / iOS Liquid Glass |
| 版本 | 0.1.0 |
| 许可证 | MIT |
| 强调色 | `#0a7cff` |
| 校验 | `skin.json` 符合 manifest v2；目录册 `warnings: []`、`diagnostics: []` |
| 平台 | DSH `0.2.0-rc.2`，Windows（macOS/Linux 未实测） |
| 依赖 | 无（不依赖任何插件；与 Wallpaper Engine 类插件互斥时由皮肤中心自动让位） |
