# WL Translation Engine

[![VS Code Marketplace](https://img.shields.io/visual-studio-marketplace/v/RithyTep.kirby-i18n?label=VS%20Code%20Marketplace&logo=visual-studio-code&style=for-the-badge)](https://marketplace.visualstudio.com/items?itemName=RithyTep.kirby-i18n)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/RithyTep.kirby-i18n?style=for-the-badge)](https://marketplace.visualstudio.com/items?itemName=RithyTep.kirby-i18n)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> Your i18n bestie for Vue projects. Auto-translate to 13 languages with one click.

![Demo](https://raw.githubusercontent.com/RithyTep/WL-Translation-Engine/main/demo.gif)

## Features

### Autocomplete for `$t()` keys

Type `$t('` and get instant suggestions from all your translation files.

![Autocomplete](https://raw.githubusercontent.com/RithyTep/WL-Translation-Engine/main/images/autocomplete.png)

### Hover Preview

Hover any translation key to see all 13 languages at once. No more file jumping.

![Hover Preview](https://raw.githubusercontent.com/RithyTep/WL-Translation-Engine/main/images/hover.png)

### Quick Add Missing Keys

Missing a key? Select text, press `Cmd+.` / `Ctrl+.`, and add translations to all 13 language files instantly.

![Quick Add](https://raw.githubusercontent.com/RithyTep/WL-Translation-Engine/main/images/quickadd.png)

### Command Palette

| Command | Shortcut | Description |
|---------|----------|-------------|
| Add Translation | `Cmd+Shift+T` | Add a new translation key |
| Search & Insert | `Cmd+Shift+K` | Search existing keys and insert |

## Supported Languages

| Language | Code |
|----------|------|
| English | `en` |
| Chinese (Simplified) | `zh_CN` |
| Chinese (Traditional) | `zh_TW` |
| Malay | `cn_MY` |
| Japanese | `ja_JP` |
| Korean | `ko_KR` |
| Thai | `th_TH` |
| Vietnamese | `vi_VN` |
| Indonesian | `id_ID` |
| Khmer | `km_KH` |
| Spanish | `es_ES` |
| Portuguese | `pt_BR` |
| Russian | `ru_RU` |

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
- Vue project with `src/lang/*.json` structure

## Configuration

```json
{
  "kirby-i18n.langPath": "src/lang"  // Custom path to language files
}
```

## How It Works

1. Extension auto-detects your `src/lang/*.json` files
2. Watches for changes and updates in real-time
3. Uses MyMemory API for translations

## Contributing

Contributions are welcome! Please open an issue or submit a PR.

## License

MIT © [RithyTep](https://github.com/RithyTep)

---

**If this extension helps you, please consider:**
- Giving it a ⭐ on [GitHub](https://github.com/RithyTep/WL-Translation-Engine)
- Leaving a [review on the Marketplace](https://marketplace.visualstudio.com/items?itemName=RithyTep.kirby-i18n&ssr=false#review-details)
