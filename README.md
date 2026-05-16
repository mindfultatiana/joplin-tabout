# Joplin Tab Out

A [Joplin](https://joplinapp.org/) desktop plugin that lets you press `Tab` to jump past closing characters — quotes, brackets, parentheses — without reaching for the arrow keys. Inspired by the VS Code Tab Out extension.

---

# Problem Statement

Joplin's Markdown editor has no built-in way to escape closing characters after typing them. After writing `"hello"`, `(param)`, or `` `code` ``, you must reach for the arrow key or click past the closing character to continue — breaking typing flow.

This friction compounds when writing structured Markdown: inline code, links, bold/italic spans, and HTML tags all require the same awkward escape. Joplin's plugin system exposes the underlying CodeMirror editor, but the CM5/CM6 compatibility shim makes keyboard interception non-trivial — existing general-purpose plugins don't solve this for Joplin specifically.

---

# Tech Stack

- **JavaScript (ES6)** — content script logic
- **TypeScript** — plugin entry point
- **Node.js** — build tooling
- **webpack 5** — bundling
- **Joplin Plugin API** — `contentScripts.register`, `codeMirrorPlugin` type
- **CodeMirror (CM5 shim / CM6 internals)** — editor interception via `cm.cm6.dom`

---

# How It Works

The plugin registers a `codeMirrorPlugin` content script. Joplin passes a CM5-compatible shim object to the content script's `plugin()` function. That shim exposes `cm.cm6` — the real underlying CM6 `EditorView`.

Rather than fighting Joplin's keymap system (which intercepts Tab before CM5/CM6 bindings are checked), the plugin attaches a **capture-phase DOM event listener** directly to `cm.cm6.dom`. This fires before any other handler:

```js
view.dom.addEventListener('keydown', function(event) {
  if (event.key !== 'Tab') return;
  const nextChar = state.doc.sliceString(pos, pos + 1);
  if (TAB_OUT_CHARS.has(nextChar)) {
    event.preventDefault();
    event.stopPropagation();
    view.dispatch({ selection: { anchor: pos + 1 } });
  }
}, true); // capture: true
```

When Tab is pressed before a closing character, the cursor moves past it. Otherwise the event propagates normally and Joplin's indent/list-continuation behavior takes over.

---

# Tab-Out Characters

| Character | Description |
|---|---|
| `"` | Double quote |
| `'` | Single quote |
| `` ` `` | Backtick (inline code) |
| `)` | Closing parenthesis |
| `]` | Closing bracket |
| `}` | Closing brace |
| `>` | Closing angle bracket |

**Exception:** Triple backtick (` ``` `) is never a tab-out target — Tab works normally for indentation inside fenced code blocks.

---

# Repository Structure

```bash
joplin-tabout/
├── manifest.json          # Plugin metadata (id, version, app_min_version)
├── package.json           # Build dependencies
├── tsconfig.json          # TypeScript config
├── webpack.config.js      # Bundle config — aliases api/ stub, no libraryTarget
├── api/
│   ├── index.js           # Runtime stub: exports global `joplin` object
│   └── index.d.ts         # TypeScript type declarations
├── scripts/
│   └── dist.js            # Packages dist/ into a .jpl TAR archive
└── src/
    ├── index.ts           # Plugin entry — registers the content script
    └── contentScript.js   # Tab interception logic (CM5 shim + CM6 internals)
```

---

# Installation

### Pre-built

1. Download `joplin.plugin.tabout-v1.0.0.jpl` from [Releases](../../releases)
2. **Windows:** right-click → Properties → check **Unblock** → OK
3. In Joplin: **Tools → Options → Plugins → Install from file**
4. Restart Joplin

### Build from source

```bash
git clone https://github.com/mindfultatiana/joplin-tabout
cd joplin-tabout
npm install
npm run dist
```

See [ReproducibilityNotes.md](../../blob/main/ReproducibilityNotes.md) for full environment details.

---

# Future Work

- **Shift+Tab to jump back** — mirror VS Code's reverse tab-out
- **Configurable character set** — let users add or remove characters via plugin settings
- **Auto-pair awareness** — only tab out when the closing character was auto-inserted (not manually typed)
- **Rich Text editor support** — currently Markdown editor only

---

# License

MIT
