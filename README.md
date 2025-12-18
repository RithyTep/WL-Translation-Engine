# Kirby i18n Translator

VS Code extension for managing translations in the Kirby Vue project.

## Features

### IntelliSense Autocomplete
Type `$t('` in Vue files to get autocomplete suggestions for all translation keys.

### Hover Preview
Hover over any `$t('key')` to see translations in all 13 languages.

### Add Translation (Cmd+Shift+T)
Add new translations directly from VS Code:
1. Enter the translation key
2. Enter the English text
3. MyMemory API translates to 12 languages automatically
4. Saves to all 13 JSON files

### Search Translation (Cmd+Shift+K)
Quick search and insert translation keys.

## Supported Languages
- English (en)
- Chinese Simplified (zh_CN)
- Chinese Traditional (zh_TW)
- Malay (cn_MY)
- Japanese (ja_JP)
- Korean (ko_KR)
- Thai (th_TH)
- Vietnamese (vi_VN)
- Indonesian (id_ID)
- Khmer (km_KH)
- Spanish (es_ES)
- Portuguese (pt_BR)
- Russian (ru_RU)

## Configuration

```json
{
  "kirby-i18n.langPath": "/path/to/your/lang/folder",
  "kirby-i18n.defaultLanguage": "en"
}
```

## Development

```bash
# Install dependencies
npm install

# Compile
npm run compile

# Watch mode
npm run watch
```

Press F5 to launch the extension in debug mode.
