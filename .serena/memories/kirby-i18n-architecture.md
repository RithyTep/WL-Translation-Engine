# Kirby i18n VS Code Extension - Architecture Documentation

## Overview
**Name**: WL Translation Engine (kirby-i18n)  
**Version**: 1.0.6  
**Publisher**: RithyTep  
**Purpose**: Vue i18n translation management with IntelliSense, hover previews, and auto-translation using MyMemory API.

## Key Features (v1.0.6)
- **Dynamic language detection** - auto-detects languages from JSON files in lang folder
- **Configurable i18n folder** - `kirby-i18n.langPath` setting
- **Custom language mapping** - `kirby-i18n.customLanguages` for unknown language codes
- **Source language setting** - `kirby-i18n.sourceLanguage` (default: `en`)
- **Workspace settings** - stored in `.vscode/settings.json`

## Project Structure
```
src/
├── extension.ts                    # Main entry point and activation logic
├── commands/
│   ├── addTranslation.ts           # Cmd+Shift+T - add new translations
│   └── searchTranslation.ts        # Cmd+Shift+K - search & insert keys
├── providers/
│   ├── completionProvider.ts       # $t() autocomplete suggestions
│   ├── hoverProvider.ts            # Translation preview on hover
│   └── codeActionProvider.ts       # Quick fix for missing keys
├── services/
│   ├── translationStore.ts         # Core data management & file I/O
│   └── myMemoryApi.ts              # Translation API integration
└── utils/
    └── languageConfig.ts           # 13 language definitions with codes/flags
```

## Core Components

### 1. TranslationStore (`src/services/translationStore.ts`)
Central data management service:
- `translations: Map<string, Record<string, string>>` - key → {langCode → text}
- `keys: string[]` - sorted list of all translation keys
- `availableLanguages: string[]` - auto-detected from JSON files
- `customLanguages: Record<string, CustomLanguageConfig>` - from settings
- `sourceLanguage: string` - base language for translations
- Loads JSON files from configured/detected lang directory
- File watcher for real-time updates
- Methods: `initialize()`, `getAllKeys()`, `getAvailableLanguages()`, `getSourceLanguage()`, `getLanguageInfoForCode()`, `getCustomLanguages()`, `getTranslation()`, `getAllTranslations()`, `keyExists()`, `searchKeys()`, `addTranslation()`, `getFormattedPreview()`, `dispose()`

### 2. MyMemoryApi (`src/services/myMemoryApi.ts`)
Translation API integration:
- Base URL: `https://api.mymemory.translated.net/get`
- `TranslationContext` interface: `{ sourceLanguage, targetLanguages, customLanguages }`
- Methods: `translateText(text, targetLangCode, sourceLangInfo, targetLangInfo)`, `translateToAllLanguages(sourceText, context, onProgress?)`
- 100ms delay between requests for rate limiting
- Falls back to source text on translation failure
- Supports dynamic source/target language configuration

### 3. Language Configuration (`src/utils/languageConfig.ts`)
- `LanguageInfo` interface: `{ code, apiCode, name, flag }`
- `CustomLanguageConfig` interface: `{ name?, flag?, apiCode? }` - for user settings
- `LANGUAGES: Record<string, LanguageInfo>` - 13 known languages as fallback
- `LANGUAGE_ORDER: string[]` - reference ordering for known languages
- `getLanguageInfo(langCode, customLanguages?)` - returns LanguageInfo, checks custom → known → generic
- `isKnownLanguage(langCode)` - checks if in known LANGUAGES
- `buildLanguageConfig(detected, custom)` - builds full config from detected languages
- Unknown languages display as: `🌐 CODE` (globe emoji + uppercase code)

## Providers (IntelliSense Integration)

### CompletionProvider (`src/providers/completionProvider.ts`)
- Triggers on: `$t('`)`, `t('`)`, `i18n.t('`)`
- Languages: vue, typescript, javascript, typescriptreact, javascriptreact
- Shows key name + English preview (50 chars max)
- Limited to 100 suggestions

### HoverProvider (`src/providers/hoverProvider.ts`)
- Detects: `$t('key')`, `t('key')`, `i18n.t('key')`
- Shows markdown table with all 13 languages, flags, and translations
- Shows "key not found" message for undefined keys

### CodeActionProvider (`src/providers/codeActionProvider.ts`)
- Detects non-existent translation keys
- Offers "Add translation" quick fix
- Triggers `kirby-i18n.addTranslationQuick` command

## Commands

### addTranslation (`src/commands/addTranslation.ts`)
- Keybinding: `Cmd+Shift+T` (macOS) / `Ctrl+Shift+T`
- Flow: input key → input English text → auto-translate → save to all files
- Offers "Copy Usage" to clipboard after success

### searchTranslation (`src/commands/searchTranslation.ts`)
- Keybinding: `Cmd+Shift+K` (macOS) / `Ctrl+Shift+K`
- QuickPick dialog with all keys
- Smart insertion: `{{ $t('key') }}` in templates, `$t('key')` in scripts

## Configuration (package.json)

### Settings
- `kirby-i18n.langPath`: Path to language JSON files relative to workspace (default: auto-detect `src/lang`)
- `kirby-i18n.sourceLanguage`: Source language code for translations (default: `en`)
- `kirby-i18n.customLanguages`: Custom language definitions for unknown codes
  ```json
  {
    "kirby-i18n.customLanguages": {
      "fr": { "name": "French", "flag": "🇫🇷", "apiCode": "fr-FR" }
    }
  }
  ```

### Activation Events
- `onLanguage:vue`
- `onLanguage:typescript`
- `onLanguage:javascript`

## Data Flow
1. Extension activates → `TranslationStore.initialize()` loads all JSON files
2. Providers query store for completions/hovers
3. Commands use `MyMemoryApi` for translation, persist via `TranslationStore`
4. File watcher triggers store reload on JSON changes

## Design Patterns
- **Service Locator**: TranslationStore as central repository
- **Provider Pattern**: VS Code interface implementations
- **Observer Pattern**: File watcher → store reload → provider updates
- **Command Pattern**: Registered commands with progress indicators

## Key Technical Notes
- No `any` types used - strong typing throughout
- Error handling with graceful fallbacks
- Performance limits: 100 completions, 200 search results
- Rate limiting: 100ms between API requests
- Non-destructive JSON file writing (preserves formatting)
