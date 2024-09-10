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
- `apiname`：成就名标识符（大写蛇形 `SNAKE_CASE` 格式）
- `achieved`：成就是否已完成（`1` / `0`）
- `unlocktime`：成就解锁时间（10 位时间戳，若未解锁则为 `0`）
- `name`：成就名（受 i18n 参数影响 `l=schinese`）
- `description`：成就描述（受 i18n 参数影响 `l=schinese`）

[AchStats 成就 API](https://www.achievementstats.com/index.php?action=api) `games/<AppID>/achievements/`：
- `apiName`：成就名标识符（小写蛇形 `snake_case` 格式）
- `name`：成就名（英文）
- `description`：成就描述（英文）
- `added`：成就加入时间（10 位时间戳）
- `iconLocked`：成就锁定时的图标
- `iconUnlocked`：成就已解锁的图标

AchStats 成就 API `profiles/<Steam64ID>/achievements/?appIds=[<AppID>,<AppID>]`：
- `appId`：游戏的 Steam appId（并不是冗余，因为参数支持一次性查询多个游戏，故而需要特别区分）
- `apiName`：成就名标识符（小写蛇形 `snake_case` 格式）
- `unlocked`：成就解锁时间（10 位时间戳）
