import { LANGUAGES, LANGUAGE_ORDER } from '../utils/languageConfig';

interface MyMemoryResponse {
  responseData: {
    translatedText: string;
    match: number;
  };
  responseStatus: number;
  responseDetails?: string;
}

export class MyMemoryApi {
  private readonly baseUrl = 'https://api.mymemory.translated.net/get';

  public async translateText(text: string, targetLang: string): Promise<string> {
    const langInfo = LANGUAGES[targetLang];
    if (!langInfo) {
      throw new Error(`Unknown language: ${targetLang}`);
    }

    const params = new URLSearchParams({
      q: text,
      langpair: `en-US|${langInfo.apiCode}`
    });

    try {
      const response = await fetch(`${this.baseUrl}?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json() as MyMemoryResponse;

      if (data.responseStatus !== 200) {
        throw new Error(data.responseDetails || 'Translation failed');
      }

      return data.responseData.translatedText;
    } catch (error) {
      console.error(`Translation error for ${targetLang}:`, error);
      throw error;
    }
  }

  public async translateToAllLanguages(
    englishText: string,
    onProgress?: (lang: string, current: number, total: number) => void
  ): Promise<Record<string, string>> {
    const translations: Record<string, string> = {
      en: englishText
    };

    const targetLanguages = LANGUAGE_ORDER.filter(lang => lang !== 'en');
    const total = targetLanguages.length;

    for (let i = 0; i < targetLanguages.length; i++) {
      const lang = targetLanguages[i];

      if (onProgress) {
        onProgress(lang, i + 1, total);
      }

      try {
        translations[lang] = await this.translateText(englishText, lang);
        await this.delay(100);
      } catch (error) {
        console.error(`Failed to translate to ${lang}:`, error);
        translations[lang] = englishText;
      }
    }

    return translations;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
