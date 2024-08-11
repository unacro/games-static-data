# Games Static Database

[NocoDB](https://github.com/nocodb/nocodb)

## Usage

Edit `config/_default/module.toml`:

```toml
[[imports]]

disable = false

path = "github.com/unacro/hugo-shortcodes"
```

Then run `hugo server` to download automatically.

## Update

```bash
hugo mod get -u
```