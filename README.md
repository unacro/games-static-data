# Games Static Database

## Usage

Edit `config/_default/module.toml`:

```toml
[[imports]]
disable = false
path = "github.com/unacro/games-static-database"
```

Then run `hugo server` to download automatically.

## Update

```bash
hugo mod get -u
```

---

曾经的实现采用了 [Notion Database API](https://developers.notion.com/)，但 Notion 实在太重重重重重了。\
而 [NocoDB](https://github.com/nocodb/nocodb) 完美符合我的期望：开源、轻量、接口简洁、可自行部署，简直就是梦中情库。

通过 GitHub 直接在线调用 JSON 数据：
```
https://github.com/unacro/games-static-database/raw/main/data/games/buckshot-roulette.json
```

通过~~互联网行业顶级大善人之一的~~ jsDelivr 缓存 CDN 调用数据：
```
https://cdn.jsdelivr.net/gh/unacro/games-static-database@main/data/games/buckshot-roulette.json
```

## Todo List

- [ ] 编写脚本利用 [NocoDB API](https://data-apis-v2.nocodb.com/) 实现导入（本仓库 JSON → NocoDB）/ 导出（NocoDB → 本仓库数据）
- [ ] 编写 GitHub Actions 的 workflow 实现自动化（仍由手动触发，自动化指可一键完成）
