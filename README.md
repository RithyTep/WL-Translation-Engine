# WL Translation Engine

> Your i18n bestie for Vue projects. Auto-translate to 13 languages with one click.

## Features

### 1. Autocomplete Keys
Type `$t('` and boom - all your translation keys pop up.

![autocomplete](https://img.shields.io/badge/trigger-$t('...'-blue)

### 2. Hover Preview
Hover over any `$t('key')` to see translations in ALL 13 languages instantly.

### 3. Quick Add (The Magic)
Got a missing key? No problem.

```vue
{{ $t('Hello World') }}
```

1. Click on `Hello World`
2. Press `Cmd + .` (Mac) or `Ctrl + .` (Windows)
3. Click **"Add translation"**
4. Done! Auto-translated to 13 languages

### 4. Command Palette

| Shortcut | Action |
|----------|--------|
| `Cmd+Shift+T` | Add new translation |
| `Cmd+Shift+K` | Search & insert key |

## Supported Languages

| Flag | Language |
|------|----------|
| 🇺🇸 | English |
| 🇨🇳 | Chinese (Simplified) |
| 🇹🇼 | Chinese (Traditional) |
| 🇲🇾 | Malay |
| 🇯🇵 | Japanese |
| 🇰🇷 | Korean |
| 🇹🇭 | Thai |
| 🇻🇳 | Vietnamese |
| 🇮🇩 | Indonesian |
| 🇰🇭 | Khmer |
| 🇪🇸 | Spanish |
| 🇧🇷 | Portuguese |
| 🇷🇺 | Russian |

## Setup

1. Install the extension
2. Open your Vue project
3. It auto-detects `src/lang/*.json` files
4. Start typing `$t('` - that's it!

### Custom Path (Optional)

If your lang files are somewhere else:

```json
// settings.json
{
  "kirby-i18n.langPath": "/path/to/your/lang/folder"
}
```

## How It Works

```
You type: {{ $t('welcome_message') }}
          ↓
Extension checks if key exists
          ↓
If missing → Cmd+. → "Add translation"
          ↓
MyMemory API translates to 12 languages
          ↓
Saves to all 13 JSON files automatically
```

## Pro Tips

- Keys are case-sensitive
- Use `snake_case` for consistency
- Refresh cache: `Cmd+Shift+P` → "WL: Refresh"

## Requirements

- VS Code 1.85+
- Vue project with `src/lang/*.json` structure

---

## Changelog

### v1.0.3 (Current)
- Renamed to **WL Translation Engine**
- Compressed icon for faster install
- Updated README for better readability

### v1.0.2
- Added **Quick Add** feature (Cmd+. to add missing keys)
- Auto-detect workspace `src/lang/` folder
- New keys append to end of file (no reordering)

### v1.0.1
- Initial release
- IntelliSense autocomplete for `$t('key')`
- Hover preview with 13 languages
- Command palette: Add & Search translations
- MyMemory API integration
- Auto-save to all 13 JSON files
- File watcher for live reload

---

## What's Inside

| Feature | Status |
|---------|--------|
| Autocomplete `$t('` | ✅ |
| Hover translations | ✅ |
| Quick add (Cmd+.) | ✅ |
| Add translation command | ✅ |
| Search key command | ✅ |
| Auto-detect lang path | ✅ |
| File watcher | ✅ |
| 13 languages support | ✅ |
| MyMemory API | ✅ |

---

Made with coffee by [@rithytep](https://github.com/rithytep)
