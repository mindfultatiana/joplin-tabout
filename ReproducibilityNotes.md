# Reproducibility Notes

## Environment

### Hardware

| Component | Spec |
|---|---|
| CPU | Intel Core i9-12900K 16-Core 3.2GHz |
| GPU | MSI Ventus 3X PLUS GeForce RTX 3080 12GB OC LHR |
| RAM | Corsair Vengeance RGB DDR4 3600MHz 32GB (2×16GB) |
| Storage | Samsung 970 EVO Plus M.2 2TB NVMe SSD |
| Motherboard | ASUS TUF Gaming Z690-Plus WiFi D4 LGA 1700 |

### OS

- Windows 11

---

# Software Versions

| Software | Version |
|---|---|
| Node.js | 14+ |
| npm | 6+ |
| webpack | 5.x |
| TypeScript | 4.x |
| Joplin Desktop | 3.5.13 |

---

# Installation

```bash
git clone https://github.com/mindfultatiana/joplin-tabout
cd joplin-tabout

npm install
npm run dist
```

This produces `joplin.plugin.tabout-v1.0.0.jpl` in the project root.

### Install the plugin

1. **Windows:** right-click the `.jpl` file → Properties → check **Unblock** → OK
2. In Joplin: **Tools → Options → Plugins → Install from file**
3. Select the `.jpl` and restart Joplin

### Verify it's running

Open **Help → Toggle Developer Tools → Console** and confirm:

```
[TabOut] plugin() called
[TabOut] keydown listener attached to cm6.dom
```

---

# Known Issues

- **Joplin 2.x not supported** — the plugin targets Joplin 3.x (CodeMirror 6 internals). The `cm.cm6` property used for DOM interception does not exist in Joplin 2.x's CM5-only runtime.
- **Rich Text editor** — tab-out has no effect in Joplin's Rich Text (WYSIWYG) editor. Only the Markdown editor is supported.
- **Windows file blocking** — `.jpl` files downloaded from the internet are blocked by Windows by default. Joplin will silently do nothing when you try to install a blocked file. Always right-click → Properties → Unblock before installing.
- **Plugin folder naming** — Joplin 3.x names the plugin cache folder after the `.jpl` filename, not the manifest ID. If you rename the `.jpl` before installing, the cache folder name will change but the plugin will still function correctly.
- **Tab in fenced code blocks** — triple-backtick (` ``` `) fence markers are intentionally excluded from tab-out. Tab indents normally inside and at the boundary of code fences.

---

# Security Notes

- No API keys, credentials, or external network requests of any kind
- All logic runs locally inside Joplin's plugin sandbox
- The plugin only reads cursor position and document text; it does not access note metadata, sync settings, or any Joplin data outside the active editor
- No production hardening needed — this is a local desktop plugin with no server component
