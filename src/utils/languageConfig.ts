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

/** Known languages as fallback reference (50+ common languages) */
export const LANGUAGES: Record<string, LanguageInfo> = {
  // English variants
  en: { code: 'en', apiCode: 'en-US', name: 'English', flag: '🇺🇸' },
  en_US: { code: 'en_US', apiCode: 'en-US', name: 'English (US)', flag: '🇺🇸' },
  en_GB: { code: 'en_GB', apiCode: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
  en_AU: { code: 'en_AU', apiCode: 'en-AU', name: 'English (Australia)', flag: '🇦🇺' },

  // Chinese variants
  zh: { code: 'zh', apiCode: 'zh-CN', name: 'Chinese', flag: '🇨🇳' },
  zh_CN: { code: 'zh_CN', apiCode: 'zh-CN', name: 'Chinese (Simplified)', flag: '🇨🇳' },
  zh_TW: { code: 'zh_TW', apiCode: 'zh-TW', name: 'Chinese (Traditional)', flag: '🇹🇼' },
  zh_HK: { code: 'zh_HK', apiCode: 'zh-TW', name: 'Chinese (Hong Kong)', flag: '🇭🇰' },

  // European languages
  fr: { code: 'fr', apiCode: 'fr-FR', name: 'French', flag: '🇫🇷' },
  fr_FR: { code: 'fr_FR', apiCode: 'fr-FR', name: 'French (France)', flag: '🇫🇷' },
  fr_CA: { code: 'fr_CA', apiCode: 'fr-CA', name: 'French (Canada)', flag: '🇨🇦' },
  de: { code: 'de', apiCode: 'de-DE', name: 'German', flag: '🇩🇪' },
  de_DE: { code: 'de_DE', apiCode: 'de-DE', name: 'German (Germany)', flag: '🇩🇪' },
  de_AT: { code: 'de_AT', apiCode: 'de-AT', name: 'German (Austria)', flag: '🇦🇹' },
  de_CH: { code: 'de_CH', apiCode: 'de-CH', name: 'German (Switzerland)', flag: '🇨🇭' },
  it: { code: 'it', apiCode: 'it-IT', name: 'Italian', flag: '🇮🇹' },
  it_IT: { code: 'it_IT', apiCode: 'it-IT', name: 'Italian', flag: '🇮🇹' },
  es: { code: 'es', apiCode: 'es-ES', name: 'Spanish', flag: '🇪🇸' },
  es_ES: { code: 'es_ES', apiCode: 'es-ES', name: 'Spanish (Spain)', flag: '🇪🇸' },
  es_MX: { code: 'es_MX', apiCode: 'es-MX', name: 'Spanish (Mexico)', flag: '🇲🇽' },
  es_AR: { code: 'es_AR', apiCode: 'es-AR', name: 'Spanish (Argentina)', flag: '🇦🇷' },
  pt: { code: 'pt', apiCode: 'pt-PT', name: 'Portuguese', flag: '🇵🇹' },
  pt_PT: { code: 'pt_PT', apiCode: 'pt-PT', name: 'Portuguese (Portugal)', flag: '🇵🇹' },
  pt_BR: { code: 'pt_BR', apiCode: 'pt-BR', name: 'Portuguese (Brazil)', flag: '🇧🇷' },
  nl: { code: 'nl', apiCode: 'nl-NL', name: 'Dutch', flag: '🇳🇱' },
  nl_NL: { code: 'nl_NL', apiCode: 'nl-NL', name: 'Dutch', flag: '🇳🇱' },
  nl_BE: { code: 'nl_BE', apiCode: 'nl-BE', name: 'Dutch (Belgium)', flag: '🇧🇪' },
  pl: { code: 'pl', apiCode: 'pl-PL', name: 'Polish', flag: '🇵🇱' },
  pl_PL: { code: 'pl_PL', apiCode: 'pl-PL', name: 'Polish', flag: '🇵🇱' },
  ru: { code: 'ru', apiCode: 'ru-RU', name: 'Russian', flag: '🇷🇺' },
  ru_RU: { code: 'ru_RU', apiCode: 'ru-RU', name: 'Russian', flag: '🇷🇺' },
  uk: { code: 'uk', apiCode: 'uk-UA', name: 'Ukrainian', flag: '🇺🇦' },
  uk_UA: { code: 'uk_UA', apiCode: 'uk-UA', name: 'Ukrainian', flag: '🇺🇦' },
  cs: { code: 'cs', apiCode: 'cs-CZ', name: 'Czech', flag: '🇨🇿' },
  cs_CZ: { code: 'cs_CZ', apiCode: 'cs-CZ', name: 'Czech', flag: '🇨🇿' },
  sk: { code: 'sk', apiCode: 'sk-SK', name: 'Slovak', flag: '🇸🇰' },
  sk_SK: { code: 'sk_SK', apiCode: 'sk-SK', name: 'Slovak', flag: '🇸🇰' },
  hu: { code: 'hu', apiCode: 'hu-HU', name: 'Hungarian', flag: '🇭🇺' },
  hu_HU: { code: 'hu_HU', apiCode: 'hu-HU', name: 'Hungarian', flag: '🇭🇺' },
  ro: { code: 'ro', apiCode: 'ro-RO', name: 'Romanian', flag: '🇷🇴' },
  ro_RO: { code: 'ro_RO', apiCode: 'ro-RO', name: 'Romanian', flag: '🇷🇴' },
  bg: { code: 'bg', apiCode: 'bg-BG', name: 'Bulgarian', flag: '🇧🇬' },
  bg_BG: { code: 'bg_BG', apiCode: 'bg-BG', name: 'Bulgarian', flag: '🇧🇬' },
  el: { code: 'el', apiCode: 'el-GR', name: 'Greek', flag: '🇬🇷' },
  el_GR: { code: 'el_GR', apiCode: 'el-GR', name: 'Greek', flag: '🇬🇷' },
  sv: { code: 'sv', apiCode: 'sv-SE', name: 'Swedish', flag: '🇸🇪' },
  sv_SE: { code: 'sv_SE', apiCode: 'sv-SE', name: 'Swedish', flag: '🇸🇪' },
  da: { code: 'da', apiCode: 'da-DK', name: 'Danish', flag: '🇩🇰' },
  da_DK: { code: 'da_DK', apiCode: 'da-DK', name: 'Danish', flag: '🇩🇰' },
  no: { code: 'no', apiCode: 'no-NO', name: 'Norwegian', flag: '🇳🇴' },
  no_NO: { code: 'no_NO', apiCode: 'no-NO', name: 'Norwegian', flag: '🇳🇴' },
  fi: { code: 'fi', apiCode: 'fi-FI', name: 'Finnish', flag: '🇫🇮' },
  fi_FI: { code: 'fi_FI', apiCode: 'fi-FI', name: 'Finnish', flag: '🇫🇮' },

  // Asian languages
  ja: { code: 'ja', apiCode: 'ja-JP', name: 'Japanese', flag: '🇯🇵' },
  ja_JP: { code: 'ja_JP', apiCode: 'ja-JP', name: 'Japanese', flag: '🇯🇵' },
  ko: { code: 'ko', apiCode: 'ko-KR', name: 'Korean', flag: '🇰🇷' },
  ko_KR: { code: 'ko_KR', apiCode: 'ko-KR', name: 'Korean', flag: '🇰🇷' },
  th: { code: 'th', apiCode: 'th-TH', name: 'Thai', flag: '🇹🇭' },
  th_TH: { code: 'th_TH', apiCode: 'th-TH', name: 'Thai', flag: '🇹🇭' },
  vi: { code: 'vi', apiCode: 'vi-VN', name: 'Vietnamese', flag: '🇻🇳' },
  vi_VN: { code: 'vi_VN', apiCode: 'vi-VN', name: 'Vietnamese', flag: '🇻🇳' },
  id: { code: 'id', apiCode: 'id-ID', name: 'Indonesian', flag: '🇮🇩' },
  id_ID: { code: 'id_ID', apiCode: 'id-ID', name: 'Indonesian', flag: '🇮🇩' },
  ms: { code: 'ms', apiCode: 'ms-MY', name: 'Malay', flag: '🇲🇾' },
  ms_MY: { code: 'ms_MY', apiCode: 'ms-MY', name: 'Malay', flag: '🇲🇾' },
  cn_MY: { code: 'cn_MY', apiCode: 'ms-MY', name: 'Malay', flag: '🇲🇾' },
  tl: { code: 'tl', apiCode: 'tl-PH', name: 'Filipino', flag: '🇵🇭' },
  tl_PH: { code: 'tl_PH', apiCode: 'tl-PH', name: 'Filipino', flag: '🇵🇭' },
  km: { code: 'km', apiCode: 'km-KH', name: 'Khmer', flag: '🇰🇭' },
  km_KH: { code: 'km_KH', apiCode: 'km-KH', name: 'Khmer', flag: '🇰🇭' },
  lo: { code: 'lo', apiCode: 'lo-LA', name: 'Lao', flag: '🇱🇦' },
  lo_LA: { code: 'lo_LA', apiCode: 'lo-LA', name: 'Lao', flag: '🇱🇦' },
  my: { code: 'my', apiCode: 'my-MM', name: 'Myanmar (Burmese)', flag: '🇲🇲' },
  my_MM: { code: 'my_MM', apiCode: 'my-MM', name: 'Myanmar (Burmese)', flag: '🇲🇲' },

  // South Asian languages
  hi: { code: 'hi', apiCode: 'hi-IN', name: 'Hindi', flag: '🇮🇳' },
  hi_IN: { code: 'hi_IN', apiCode: 'hi-IN', name: 'Hindi', flag: '🇮🇳' },
  bn: { code: 'bn', apiCode: 'bn-BD', name: 'Bengali', flag: '🇧🇩' },
  bn_BD: { code: 'bn_BD', apiCode: 'bn-BD', name: 'Bengali', flag: '🇧🇩' },
  bn_IN: { code: 'bn_IN', apiCode: 'bn-IN', name: 'Bengali (India)', flag: '🇮🇳' },
  ta: { code: 'ta', apiCode: 'ta-IN', name: 'Tamil', flag: '🇮🇳' },
  ta_IN: { code: 'ta_IN', apiCode: 'ta-IN', name: 'Tamil', flag: '🇮🇳' },
  te: { code: 'te', apiCode: 'te-IN', name: 'Telugu', flag: '🇮🇳' },
  te_IN: { code: 'te_IN', apiCode: 'te-IN', name: 'Telugu', flag: '🇮🇳' },
  mr: { code: 'mr', apiCode: 'mr-IN', name: 'Marathi', flag: '🇮🇳' },
  mr_IN: { code: 'mr_IN', apiCode: 'mr-IN', name: 'Marathi', flag: '🇮🇳' },
  gu: { code: 'gu', apiCode: 'gu-IN', name: 'Gujarati', flag: '🇮🇳' },
  gu_IN: { code: 'gu_IN', apiCode: 'gu-IN', name: 'Gujarati', flag: '🇮🇳' },
  pa: { code: 'pa', apiCode: 'pa-IN', name: 'Punjabi', flag: '🇮🇳' },
  pa_IN: { code: 'pa_IN', apiCode: 'pa-IN', name: 'Punjabi', flag: '🇮🇳' },
  ur: { code: 'ur', apiCode: 'ur-PK', name: 'Urdu', flag: '🇵🇰' },
  ur_PK: { code: 'ur_PK', apiCode: 'ur-PK', name: 'Urdu', flag: '🇵🇰' },
  ne: { code: 'ne', apiCode: 'ne-NP', name: 'Nepali', flag: '🇳🇵' },
  ne_NP: { code: 'ne_NP', apiCode: 'ne-NP', name: 'Nepali', flag: '🇳🇵' },
  si: { code: 'si', apiCode: 'si-LK', name: 'Sinhala', flag: '🇱🇰' },
  si_LK: { code: 'si_LK', apiCode: 'si-LK', name: 'Sinhala', flag: '🇱🇰' },

  // Middle Eastern languages
  ar: { code: 'ar', apiCode: 'ar-SA', name: 'Arabic', flag: '🇸🇦' },
  ar_SA: { code: 'ar_SA', apiCode: 'ar-SA', name: 'Arabic (Saudi Arabia)', flag: '🇸🇦' },
  ar_AE: { code: 'ar_AE', apiCode: 'ar-AE', name: 'Arabic (UAE)', flag: '🇦🇪' },
  ar_EG: { code: 'ar_EG', apiCode: 'ar-EG', name: 'Arabic (Egypt)', flag: '🇪🇬' },
  he: { code: 'he', apiCode: 'he-IL', name: 'Hebrew', flag: '🇮🇱' },
  he_IL: { code: 'he_IL', apiCode: 'he-IL', name: 'Hebrew', flag: '🇮🇱' },
  fa: { code: 'fa', apiCode: 'fa-IR', name: 'Persian', flag: '🇮🇷' },
  fa_IR: { code: 'fa_IR', apiCode: 'fa-IR', name: 'Persian', flag: '🇮🇷' },
  tr: { code: 'tr', apiCode: 'tr-TR', name: 'Turkish', flag: '🇹🇷' },
  tr_TR: { code: 'tr_TR', apiCode: 'tr-TR', name: 'Turkish', flag: '🇹🇷' },

  // African languages
  sw: { code: 'sw', apiCode: 'sw-KE', name: 'Swahili', flag: '🇰🇪' },
  sw_KE: { code: 'sw_KE', apiCode: 'sw-KE', name: 'Swahili', flag: '🇰🇪' },
  sw_TZ: { code: 'sw_TZ', apiCode: 'sw-TZ', name: 'Swahili (Tanzania)', flag: '🇹🇿' },
  af: { code: 'af', apiCode: 'af-ZA', name: 'Afrikaans', flag: '🇿🇦' },
  af_ZA: { code: 'af_ZA', apiCode: 'af-ZA', name: 'Afrikaans', flag: '🇿🇦' },
  am: { code: 'am', apiCode: 'am-ET', name: 'Amharic', flag: '🇪🇹' },
  am_ET: { code: 'am_ET', apiCode: 'am-ET', name: 'Amharic', flag: '🇪🇹' },

  // Other languages
  ca: { code: 'ca', apiCode: 'ca-ES', name: 'Catalan', flag: '🇪🇸' },
  ca_ES: { code: 'ca_ES', apiCode: 'ca-ES', name: 'Catalan', flag: '🇪🇸' },
  eu: { code: 'eu', apiCode: 'eu-ES', name: 'Basque', flag: '🇪🇸' },
  eu_ES: { code: 'eu_ES', apiCode: 'eu-ES', name: 'Basque', flag: '🇪🇸' },
  gl: { code: 'gl', apiCode: 'gl-ES', name: 'Galician', flag: '🇪🇸' },
  gl_ES: { code: 'gl_ES', apiCode: 'gl-ES', name: 'Galician', flag: '🇪🇸' },
  hr: { code: 'hr', apiCode: 'hr-HR', name: 'Croatian', flag: '🇭🇷' },
  hr_HR: { code: 'hr_HR', apiCode: 'hr-HR', name: 'Croatian', flag: '🇭🇷' },
  sr: { code: 'sr', apiCode: 'sr-RS', name: 'Serbian', flag: '🇷🇸' },
  sr_RS: { code: 'sr_RS', apiCode: 'sr-RS', name: 'Serbian', flag: '🇷🇸' },
  sl: { code: 'sl', apiCode: 'sl-SI', name: 'Slovenian', flag: '🇸🇮' },
  sl_SI: { code: 'sl_SI', apiCode: 'sl-SI', name: 'Slovenian', flag: '🇸🇮' },
  et: { code: 'et', apiCode: 'et-EE', name: 'Estonian', flag: '🇪🇪' },
  et_EE: { code: 'et_EE', apiCode: 'et-EE', name: 'Estonian', flag: '🇪🇪' },
  lv: { code: 'lv', apiCode: 'lv-LV', name: 'Latvian', flag: '🇱🇻' },
  lv_LV: { code: 'lv_LV', apiCode: 'lv-LV', name: 'Latvian', flag: '🇱🇻' },
  lt: { code: 'lt', apiCode: 'lt-LT', name: 'Lithuanian', flag: '🇱🇹' },
  lt_LT: { code: 'lt_LT', apiCode: 'lt-LT', name: 'Lithuanian', flag: '🇱🇹' }
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
