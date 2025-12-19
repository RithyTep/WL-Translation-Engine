import { LanguageInfo, getLanguageInfo, CustomLanguageConfig } from '../utils/languageConfig';

interface MyMemoryResponse {
  responseData: {
    translatedText: string;
    match: number;
  };
  responseStatus: number;
  responseDetails?: string;
}

export interface TranslationContext {
  sourceLanguage: string;
  targetLanguages: string[];
  customLanguages?: Record<string, CustomLanguageConfig>;
}

export class MyMemoryApi {
  private readonly baseUrl = 'https://api.mymemory.translated.net/get';

  /**
   * Translate text from source language to target language.
   */
  public async translateText(
    text: string,
    targetLangCode: string,
    sourceLangInfo: LanguageInfo,
    targetLangInfo: LanguageInfo
  ): Promise<string> {
    const params = new URLSearchParams({
      q: text,
      langpair: `${sourceLangInfo.apiCode}|${targetLangInfo.apiCode}`
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
      console.error(`Translation error for ${targetLangCode}:`, error);
      throw error;
    }
  }

  /**
   * Translate source text to all target languages.
   */
  public async translateToAllLanguages(
    sourceText: string,
    context: TranslationContext,
    onProgress?: (lang: string, current: number, total: number) => void
  ): Promise<Record<string, string>> {
    const { sourceLanguage, targetLanguages, customLanguages } = context;

    const translations: Record<string, string> = {
      [sourceLanguage]: sourceText
    };

    const sourceLangInfo = getLanguageInfo(sourceLanguage, customLanguages);
    const langsToTranslate = targetLanguages.filter(lang => lang !== sourceLanguage);
    const total = langsToTranslate.length;

    for (let i = 0; i < langsToTranslate.length; i++) {
      const lang = langsToTranslate[i];
      const targetLangInfo = getLanguageInfo(lang, customLanguages);

      if (onProgress) {
        onProgress(lang, i + 1, total);
      }

      try {
        translations[lang] = await this.translateText(
          sourceText,
          lang,
          sourceLangInfo,
          targetLangInfo
        );
        await this.delay(100);
      } catch (error) {
        console.error(`Failed to translate to ${lang}:`, error);
        // Fallback to source text on error
        translations[lang] = sourceText;
      }
    }

    return translations;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
