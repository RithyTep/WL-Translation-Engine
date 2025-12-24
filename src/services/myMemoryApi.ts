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
   * Translate source text to all target languages in parallel with batching.
   * Uses concurrent requests for speed while respecting API limits.
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

    if (total === 0) {
      return translations;
    }

    // Batch size for concurrent requests (balance speed vs rate limiting)
    const BATCH_SIZE = 10;
    let completed = 0;

    // Process in batches for parallel execution
    for (let i = 0; i < langsToTranslate.length; i += BATCH_SIZE) {
      const batch = langsToTranslate.slice(i, i + BATCH_SIZE);

      const batchPromises = batch.map(async (lang) => {
        const targetLangInfo = getLanguageInfo(lang, customLanguages);

        try {
          const translated = await this.translateText(
            sourceText,
            lang,
            sourceLangInfo,
            targetLangInfo
          );
          translations[lang] = translated;
        } catch (error) {
          console.error(`Failed to translate to ${lang}:`, error);
          translations[lang] = sourceText;
        }

        completed++;
        if (onProgress) {
          onProgress(lang, completed, total);
        }
      });

      // Execute batch in parallel
      await Promise.all(batchPromises);

      // Small delay between batches to avoid rate limiting (only if more batches remain)
      if (i + BATCH_SIZE < langsToTranslate.length) {
        await this.delay(50);
      }
    }

    return translations;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
