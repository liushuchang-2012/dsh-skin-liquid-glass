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

## 1b. 插件形态安装（推荐）

同一份皮肤也做成了标准的 DSH 客户端插件（仓库根 `package.json` 声明 `dsh.bundle`，
`client.js` 由 `scripts/build.mjs` 生成），所以可以直接装：

```powershell
dsh plugin --profile web add github:liushuchang-2012/dsh-skin-liquid-glass
```

插件自己注入三层 `<style>`（玻璃/token 层、结构 patch 层、壁纸层），关闭时只删这三层，
不依赖任何共享模块（`dsh.client.inject` 为空），整包 165 KB、零依赖。

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

## 3. 申请收录（已提交 PR）

2026-10-15 已向 **awesome-dsh-plugin**（DSH 插件市场列表）提交 PR：

<https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/pull/7404>

- 投稿就是**一个文件**：`data/plugins/liushuchang-2012__dsh-skin-liquid-glass.yml`，
  `category: theme`（README 由仓库脚本生成，不手工改，也不需要在 PR 里带）。
- 仓库侧前置条件都已满足：根 `package.json` 声明 `dsh.bundle`（这就是「可 `dsh plugin add`」的依据）、
  仓库加了 `dsh-plugin` topic、仓库创建已满 1 天、根目录有 `screenshots.json`（相对路径指向仓库内图片）。
- 投稿前本地跑过的验证：`npm test` → 14/14（零依赖，7 个 bundle 生命周期 + 7 个 manifest/接线）、
  `node scripts/build.mjs --check` → 已提交的 `client.js` 与构建产物一致、
  实机按 `window.__ModuleLoader__.load` 真实形态加载过一次（三层 `<style>` 注入成功，
  把皮肤中心那几层拿掉后 token/壁纸仍然生效，`setEnabled(false)` 只删掉自己的三层）。

可选后续（都不影响本次收录）：

- 发 npm 包：预构建安装可以跳过 `allowBuilds` 构建授权；
- 打 Release + 附预构建 tarball，然后在条目里加 `tarball:` 字段，市场会优先展示它；
- 皮肤中心那条分发路径（`https://dsh-market.com/manifest/skins.json`）仍然独立存在。

申请时可附的材料：

| 项目 | 值 |
| --- | --- |
| id | `ios-liquid-glass` |
| 仓库 | <https://github.com/liushuchang-2012/dsh-skin-liquid-glass> |
| 市场条目 | `data/plugins/liushuchang-2012__dsh-skin-liquid-glass.yml`（PR #7404） |
| 作者 | `liushuchang-2012` |
| 名称 | iOS 液态玻璃 / iOS Liquid Glass |
| 版本 | 0.1.0 |
| 许可证 | MIT |
| 强调色 | `#0a7cff` |
| 校验 | `skin.json` 符合 manifest v2；目录册 `warnings: []`、`diagnostics: []`；`npm test` 14/14 |
| 平台 | DSH `0.2.0-rc.2`，Windows（macOS/Linux 未实测） |
| 依赖 | 无（插件形态零依赖、不需要共享模块；皮肤中心形态纯声明式） |
