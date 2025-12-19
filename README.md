# WL-Translation-Engine

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
[![GitHub Stars](https://img.shields.io/github/stars/RithyTep/WL-Translation-Engine?style=for-the-badge)](https://github.com/RithyTep/WL-Translation-Engine/stargazers)

**A powerful, type-safe multi-language translation engine for modern web applications.**

[Features](#features) • [Installation](#installation) • [Usage](#usage) • [API](#api) • [Contributing](#contributing)

</div>

---

## Features

- 🌍 **Multi-language Support** - Handle unlimited languages with ease
- 🔒 **Type-safe** - Full TypeScript support with strict typing
- ⚡ **Fast & Lightweight** - Minimal bundle size, maximum performance
- 🔄 **Dynamic Loading** - Load translations on-demand
- 📦 **Framework Agnostic** - Works with React, Angular, Vue, and vanilla JS
- 🎯 **Interpolation** - Variable substitution in translations
- 📁 **Namespace Support** - Organize translations by feature/module

## Installation

```bash
# npm
npm install wl-translation-engine

# yarn
yarn add wl-translation-engine

# pnpm
pnpm add wl-translation-engine
```

## Quick Start

```typescript
import { TranslationEngine } from 'wl-translation-engine';

// Initialize the engine
const i18n = new TranslationEngine({
  defaultLanguage: 'en',
  fallbackLanguage: 'en',
  languages: ['en', 'km', 'zh'],
});

// Add translations
i18n.addTranslations('en', {
  greeting: 'Hello, {{name}}!',
  welcome: 'Welcome to our app',
});

i18n.addTranslations('km', {
  greeting: 'សួស្តី, {{name}}!',
  welcome: 'សូមស្វាគមន៍មកកាន់កម្មវិធីរបស់យើង',
});

// Use translations
console.log(i18n.t('greeting', { name: 'Rithy' })); // Hello, Rithy!

// Switch language
i18n.setLanguage('km');
console.log(i18n.t('greeting', { name: 'Rithy' })); // សួស្តី, Rithy!
```

## API Reference

### `TranslationEngine`

| Method | Description |
|--------|-------------|
| `t(key, params?)` | Translate a key with optional parameters |
| `setLanguage(lang)` | Change the current language |
| `getLanguage()` | Get the current language |
| `addTranslations(lang, translations)` | Add translations for a language |
| `hasTranslation(key)` | Check if a translation exists |

### Configuration Options

```typescript
interface TranslationConfig {
  defaultLanguage: string;
  fallbackLanguage?: string;
  languages: string[];
  interpolation?: {
    prefix: string;  // default: '{{'
    suffix: string;  // default: '}}'
  };
}
```

## Framework Integration

### React

```tsx
import { useTranslation } from 'wl-translation-engine/react';

function MyComponent() {
  const { t, language, setLanguage } = useTranslation();

  return (
    <div>
      <h1>{t('welcome')}</h1>
      <button onClick={() => setLanguage('km')}>ភាសាខ្មែរ</button>
    </div>
  );
}
```

### Angular

```typescript
import { TranslationModule } from 'wl-translation-engine/angular';

@NgModule({
  imports: [TranslationModule.forRoot({ defaultLanguage: 'en' })]
})
export class AppModule {}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Made with ❤️ in Cambodia by [Rithy Tep](https://github.com/RithyTep)**

[![Portfolio](https://img.shields.io/badge/Portfolio-rithytep.online-blue?style=flat-square)](https://portfolio.rithytep.online/)

</div>
