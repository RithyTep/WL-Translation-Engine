export interface LanguageInfo {
  code: string;
  apiCode: string;
  name: string;
  flag: string;
}

/** Custom language definition from user settings */
export interface CustomLanguageConfig {
  name?: string;
  flag?: string;
  apiCode?: string;
}

/** Known languages as fallback reference */
export const LANGUAGES: Record<string, LanguageInfo> = {
  en: { code: 'en', apiCode: 'en-US', name: 'English', flag: '🇺🇸' },
  zh_CN: { code: 'zh_CN', apiCode: 'zh-CN', name: 'Chinese (Simplified)', flag: '🇨🇳' },
  zh_TW: { code: 'zh_TW', apiCode: 'zh-TW', name: 'Chinese (Traditional)', flag: '🇹🇼' },
  cn_MY: { code: 'cn_MY', apiCode: 'ms-MY', name: 'Malay', flag: '🇲🇾' },
  ja_JP: { code: 'ja_JP', apiCode: 'ja-JP', name: 'Japanese', flag: '🇯🇵' },
  ko_KR: { code: 'ko_KR', apiCode: 'ko-KR', name: 'Korean', flag: '🇰🇷' },
  th_TH: { code: 'th_TH', apiCode: 'th-TH', name: 'Thai', flag: '🇹🇭' },
  vi_VN: { code: 'vi_VN', apiCode: 'vi-VN', name: 'Vietnamese', flag: '🇻🇳' },
  id_ID: { code: 'id_ID', apiCode: 'id-ID', name: 'Indonesian', flag: '🇮🇩' },
  km_KH: { code: 'km_KH', apiCode: 'km-KH', name: 'Khmer', flag: '🇰🇭' },
  es_ES: { code: 'es_ES', apiCode: 'es-ES', name: 'Spanish', flag: '🇪🇸' },
  pt_BR: { code: 'pt_BR', apiCode: 'pt-BR', name: 'Portuguese', flag: '🇧🇷' },
  ru_RU: { code: 'ru_RU', apiCode: 'ru-RU', name: 'Russian', flag: '🇷🇺' }
};

/** Default order for known languages (used as reference) */
export const LANGUAGE_ORDER = [
  'en', 'zh_CN', 'zh_TW', 'cn_MY', 'ja_JP', 'ko_KR',
  'th_TH', 'vi_VN', 'id_ID', 'km_KH', 'es_ES', 'pt_BR', 'ru_RU'
];

/**
 * Get language info for a code, checking custom languages first, then known languages.
 * Returns generic info for unknown codes (globe emoji + uppercase code as name).
 */
export function getLanguageInfo(
  langCode: string,
  customLanguages?: Record<string, CustomLanguageConfig>
): LanguageInfo {
  // Check custom languages first
  if (customLanguages && customLanguages[langCode]) {
    const custom = customLanguages[langCode];
    return {
      code: langCode,
      apiCode: custom.apiCode || langCode,
      name: custom.name || langCode.toUpperCase(),
      flag: custom.flag || '🌐'
    };
  }

  // Check known languages
  if (LANGUAGES[langCode]) {
    return LANGUAGES[langCode];
  }

  // Return generic info for unknown codes
  return {
    code: langCode,
    apiCode: langCode,
    name: langCode.toUpperCase(),
    flag: '🌐'
  };
}

/**
 * Check if a language code is in the known languages list.
 */
export function isKnownLanguage(langCode: string): boolean {
  return langCode in LANGUAGES;
}

/**
 * Build a complete language config map from detected languages,
 * merging with custom languages and known languages.
 */
export function buildLanguageConfig(
  detectedLanguages: string[],
  customLanguages?: Record<string, CustomLanguageConfig>
): Record<string, LanguageInfo> {
  const result: Record<string, LanguageInfo> = {};

  for (const langCode of detectedLanguages) {
    result[langCode] = getLanguageInfo(langCode, customLanguages);
  }

  return result;
}

/** @deprecated Use getLanguageInfo with customLanguages parameter */
export function getAllLanguageCodes(): string[] {
  return LANGUAGE_ORDER;
}
