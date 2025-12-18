export interface LanguageInfo {
  code: string;
  apiCode: string;
  name: string;
  flag: string;
}

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

export const LANGUAGE_ORDER = [
  'en', 'zh_CN', 'zh_TW', 'cn_MY', 'ja_JP', 'ko_KR',
  'th_TH', 'vi_VN', 'id_ID', 'km_KH', 'es_ES', 'pt_BR', 'ru_RU'
];

export function getLanguageInfo(langCode: string): LanguageInfo | undefined {
  return LANGUAGES[langCode];
}

export function getAllLanguageCodes(): string[] {
  return LANGUAGE_ORDER;
}
