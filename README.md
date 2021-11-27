# deno-dex

[![ci](https://github.com/kawarimidoll/deno-dex/workflows/ci/badge.svg)](.github/workflows/ci.yml)
[![deno.land](https://img.shields.io/badge/deno-%5E1.16.0-green?logo=deno)](https://deno.land)
[![vr scripts](https://badges.velociraptor.run/flat.svg)](https://velociraptor.run)
[![LICENSE](https://img.shields.io/badge/license-MIT-brightgreen)](LICENSE)

A dexterous deno executor (only for development)

Commentary article in Japanese:
https://zenn.dev/kawarimidoll/articles/d371abbd46b65b

## Setup

Install by `deno install`:

```
deno install --allow-read --allow-write --allow-run --reload --force --name dex https://pax.deno.dev/kawarimidoll/deno-dex/main.ts
```

The reasons why these permissions are required are:

- `read`: to watch file changes and current working directory
- `write`: to save intermediate script file in `$DENO_DIR`
- `run`: to run and kill process

## Features

- Run `deno run` or `deno test` for the file as argument.
  - Detect the file is for test or not.
  - Add `--allow-all --unstable --no-check --watch` for fast development.
- There are several options.
  - `--clear`: Clear console every restart.
  - `--watch`: Watch changes of any files you specified.
  - Other options are passed to `deno run` or `deno test` transparently.
- Auto-detect
  [import maps](https://deno.land/manual@v1.16.0/linking_to_external_code/import_maps)
  and
  [configuration files](https://deno.land/manual@v1.16.0/getting_started/configuration_file).
  - When `dex` starts without `--import-map` option and there is
    `import_map.json`, `--import-map=import_map.json` is implicitly added.
  - When `dex` starts without `--config` option and there is one of
    `deno.jsonc`, `deno.json` or `tsconfig.json`, `--config=[one of them]` is
    implicitly added.
  - The arguments of `--import-map` and `--config` are also passed to `--watch`
    option of `dex`.

## Usage

Run the file by `deno run`:

```
dex hello.ts
# -> deno run --allow-all --unstable --no-check --watch hello.ts
```

Test the file by `deno test` if the file is
[test file](https://deno.land/manual/testing#testing):

```
dex hello_test.ts
# -> deno test --allow-all --unstable --no-check --watch hello_test.ts
```

For more details, see help:

```
dex --help
```

## Caution

As written above, `dex` skips all checks (`--allow-all --unstable --no-check`).
This increases productivity in development, but decreases security. Use it only
for your own code.

When [`Deno.exit()`](https://doc.deno.land/builtin/stable#Deno.exit) is called,
process will be stopped without restarting. This is same as normal
`deno run --watch` behavior.

## Vim/Neovim command

If you using Vim or Neovim, put the definition below in your configuration file
to enable `:Dex` command.

```vim
command! -nargs=* -bang Dex silent only! | botright 12 split |
    \ execute 'terminal' (has('nvim') ? '' : '++curwin') 'dex'
    \   (<bang>0 ? '--clear' : '') <q-args> expand('%:p') |
    \ stopinsert | execute 'normal! G' | set bufhidden=wipe |
    \ execute 'autocmd BufEnter <buffer> if winnr("$") == 1 | quit! | endif' |
    \ wincmd k
```

- `:Dex` to run `dex` with the current file in the terminal window under editor
  area.
  - `:Dex` accepts runtime options, like as `:Dex --quite`
- `:Dex!` is shorthand of `:Dex --clear`

## Acknowledgements

`--watch` option is heavily inspired by this article.

[Build a live reloader and explore Deno! 🦕 - DEV Community](https://dev.to/otanriverdi/let-s-explore-deno-by-building-a-live-reloader-j47)

---

```ts
if (this.repo.isAwesome || this.repo.isHelpful) {
  star(this.repo);
}
```

<!-- this part is inspired by https://github.com/bhumijgupta/Deno-news-cli -->
