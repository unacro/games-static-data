# Games Static Database

## Usage

### Hugo

#### Install Module

Edit `config/_default/module.toml`:

```toml
[[imports]]
disable = false
path = "github.com/unacro/games-static-database"
```

Then run `hugo server` to download automatically.

#### Update Module

```bash
hugo mod get -u
```

### Other

通过 GitHub 直接在线调用 JSON 数据：
```
https://github.com/unacro/games-static-database/raw/main/data/games/buckshot-roulette.json
```

通过~~互联网行业顶级大善人之一的~~ jsDelivr 缓存 CDN 调用数据：
```
https://cdn.jsdelivr.net/gh/unacro/games-static-database@main/data/games/buckshot-roulette.json
```
