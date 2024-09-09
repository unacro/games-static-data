# Games Static Database 配套脚本

曾经的实现采用了 [Notion Database API](https://developers.notion.com/)，但 Notion 实在太重重重重重了。\
而 [NocoDB](https://github.com/nocodb/nocodb) 完美符合我的期望：开源、轻量、接口简洁、可自行部署，简直就是梦中情库。

## Todo List

- [x] 编写脚本利用 [NocoDB API](https://data-apis-v2.nocodb.com/) 实现导入（本仓库 JSON → NocoDB）/ 导出（NocoDB → 本仓库数据）
- [ ] 编写脚本利用 [Notion API](https://developers.notion.com/docs/getting-started) 实现导入（本仓库 JSON → Notion）/ 导出（Notion → 本仓库数据）
- [ ] 编写 GitHub Actions 的 workflow 实现自动化（仍由手动触发，自动化指可一键完成）

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
