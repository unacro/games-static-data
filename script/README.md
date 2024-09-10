# Games Static Database 配套脚本

曾经的实现采用了 [Notion Database API](https://developers.notion.com/)，但 Notion 实在太重重重重重了。\
而 [NocoDB](https://github.com/nocodb/nocodb) 完美符合我的期望：开源、轻量、接口简洁、可自行部署，简直就是梦中情库。

## Todo List

- [x] 编写脚本利用 [NocoDB API](https://data-apis-v2.nocodb.com/) 实现导入（本仓库 JSON → NocoDB）/ 导出（NocoDB → 本仓库数据）
- [ ] 编写脚本利用 [Notion API](https://developers.notion.com/docs/getting-started) 实现导入（本仓库 JSON → Notion）/ 导出（Notion → 本仓库数据）
- [ ] 编写 GitHub Actions 的 workflow 实现自动化（仍由手动触发，自动化指可一键完成）
- [x] 使用 Steam 成就 API 获取数据

## 用法

参考 `.env.example` 编辑 `.env`。

### 下载（缓存游戏数据到本地）

```bash
bun run download
```

从云端数据库下载游戏数据到本地。

### 上传（当前仅可更新，未测试修改数据表结构）

更新数据表

```bash
bun run upload
```

从本地上传游戏数据到云端数据库。

## 开发日志

### Steam 成就 API 笔记

> ~~文档是不清不楚的，屎山是可能十年历史起步的。~~

[Steam 官方的成就 API](https://partner.steamgames.com/doc/webapi/ISteamUserStats#GetPlayerAchievements)：
- _string_ `apiname`：成就名标识符（大写蛇形 `SNAKE_CASE` 格式）
- _number_ `achieved`：成就是否已完成（`1` / `0`）
- _number_ `unlocktime`：成就解锁时间（10 位时间戳，若未解锁则为 `0`）
- _string_ `name`：成就名（受 i18n 参数影响 `l=schinese`）
- _string_ `description`：成就描述（受 i18n 参数影响 `l=schinese`）

[AchStats 成就 API](https://www.achievementstats.com/index.php?action=api) `games/<AppID>/achievements/`：
- _string_ `apiName`：成就名标识符（小写蛇形 `snake_case` 格式）
- _string_ `name`：成就名（英文）
- _string_ `description`：成就描述（英文）
- _string_ `added`：成就加入时间（10 位时间戳）
- _string_ `iconLocked`：成就锁定时的图标
- _string_ `iconUnlocked`：成就已解锁的图标

AchStats 成就 API `profiles/<Steam64ID>/achievements/?appIds=[<AppID>,<AppID>]`：
- _string_ `appId`：游戏的 Steam appId（并不是冗余，因为参数支持一次性查询多个游戏，故而需要特别区分）
- _string_ `apiName`：成就名标识符（小写蛇形 `snake_case` 格式）
- _string_ `unlocked`：成就解锁时间（10 位时间戳）

已知：
- Steam 特有中文的 `成就名` 和 `描述`（缺少中文时会自动 fallback 到英文）
- AchStats（仅）有英文的 `成就名` 和 `描述`，但特有 `成就加入时间` 和是否已解锁的两种 `成就图标`

那么简单组合一下不就齐活了？我全都要.jpg

> 另，有了成就图标可以~~顺便（？）做一个成就追踪工具~~。
