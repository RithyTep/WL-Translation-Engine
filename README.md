# WL Translation Engine

[![VS Code Marketplace](https://img.shields.io/visual-studio-marketplace/v/RithyTep.kirby-i18n?label=VS%20Code%20Marketplace&logo=visual-studio-code&style=for-the-badge)](https://marketplace.visualstudio.com/items?itemName=RithyTep.kirby-i18n)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/RithyTep.kirby-i18n?style=for-the-badge)](https://marketplace.visualstudio.com/items?itemName=RithyTep.kirby-i18n)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> Your i18n bestie for Vue projects. Auto-translate with dynamic language support.

![Demo](https://raw.githubusercontent.com/RithyTep/WL-Translation-Engine/main/demo.gif)

## Features

### Autocomplete for `$t()` keys

Type `$t('` and get instant suggestions from all your translation files.

### Hover Preview

Hover any translation key to see all languages at once. No more file jumping.

### Quick Add Missing Keys

Missing a key? Select text, press `Cmd+.` / `Ctrl+.`, and add translations to all language files instantly.

### Dynamic Language Detection

The extension automatically detects languages from your JSON files. Add a new language file and it's instantly recognized!

### Command Palette

| Command | Shortcut | Description |
|---------|----------|-------------|
| Add Translation | `Cmd+Shift+T` | Add a new translation key |
| Search & Insert | `Cmd+Shift+K` | Search existing keys and insert |
| Refresh Cache | - | Reload all translation files |

## Installation

### From VS Code

1. Open VS Code
2. Press `Cmd+P` / `Ctrl+P`
3. Type `ext install RithyTep.kirby-i18n`
4. Press Enter

### From Marketplace

[Install from VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=RithyTep.kirby-i18n)

## Requirements

- VS Code 1.85+
- Vue/TypeScript/JavaScript project with language JSON files

## Configuration

Add to your `.vscode/settings.json`:

```json
{
  // Path to language files (relative to workspace)
  "kirby-i18n.langPath": "src/lang",

  // Source language for translations (default: "en")
  "kirby-i18n.sourceLanguage": "en",

  // Custom language definitions for unknown codes
  "kirby-i18n.customLanguages": {
    "fr": {
      "name": "French",
      "flag": "🇫🇷",
      "apiCode": "fr-FR"
    },
    "de": {
      "name": "German",
      "flag": "🇩🇪",
      "apiCode": "de-DE"
    }
  }
}
```

### Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `kirby-i18n.langPath` | `src/lang` | Path to language JSON files directory |
| `kirby-i18n.sourceLanguage` | `en` | Source language code for translations |
| `kirby-i18n.customLanguages` | `{}` | Custom language definitions |

## Supported Languages (Built-in)

These languages are recognized automatically:

| Language | Code | Flag |
|----------|------|------|
| English | `en` | 🇺🇸 |
| Chinese (Simplified) | `zh_CN` | 🇨🇳 |
| Chinese (Traditional) | `zh_TW` | 🇹🇼 |
| Malay | `cn_MY` | 🇲🇾 |
| Japanese | `ja_JP` | 🇯🇵 |
| Korean | `ko_KR` | 🇰🇷 |
| Thai | `th_TH` | 🇹🇭 |
| Vietnamese | `vi_VN` | 🇻🇳 |
| Indonesian | `id_ID` | 🇮🇩 |
| Khmer | `km_KH` | 🇰🇭 |
| Spanish | `es_ES` | 🇪🇸 |
| Portuguese | `pt_BR` | 🇧🇷 |
| Russian | `ru_RU` | 🇷🇺 |

**Note:** Unknown language codes display as `🌐 CODE`. Use `customLanguages` setting to add names and flags.

## How It Works

1. Extension auto-detects `*.json` files in your language directory
2. Watches for changes and updates in real-time
3. Uses MyMemory API for auto-translation
4. Supports any number of languages (not limited to 13!)

## What's New in v1.0.6

- **Dynamic language detection** - Auto-detects from JSON files
- **Configurable source language** - Not limited to English
- **Custom language definitions** - Add any language with custom flags
- **Workspace settings** - Configure per project in `.vscode/settings.json`

## Contributing

Contributions are welcome! Please open an issue or submit a PR.

## License

MIT © [RithyTep](https://github.com/RithyTep)

---

**If this extension helps you, please consider:**
- Giving it a ⭐ on [GitHub](https://github.com/RithyTep/WL-Translation-Engine)
- Leaving a [review on the Marketplace](https://marketplace.visualstudio.com/items?itemName=RithyTep.kirby-i18n&ssr=false#review-details)
