import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { getLanguageInfo, CustomLanguageConfig, LanguageInfo } from '../utils/languageConfig';

export interface TranslationEntry {
  key: string;
  translations: Record<string, string>;
}

export class TranslationStore {
  private translations: Map<string, Record<string, string>> = new Map();
  private keys: string[] = [];
  private langPath: string = '';
  private availableLanguages: string[] = [];
  private customLanguages: Record<string, CustomLanguageConfig> = {};
  private sourceLanguage: string = 'en';
  private fileWatcher: vscode.FileSystemWatcher | undefined;
  private onDidChangeEmitter = new vscode.EventEmitter<void>();
  public onDidChange = this.onDidChangeEmitter.event;

  constructor() {
    this.updateConfiguration();
  }

  private updateConfiguration(): void {
    const config = vscode.workspace.getConfiguration('kirby-i18n');
    const configPath = config.get<string>('langPath');
    this.customLanguages = config.get<Record<string, CustomLanguageConfig>>('customLanguages') || {};
    this.sourceLanguage = config.get<string>('sourceLanguage') || 'en';

    if (configPath && configPath.trim()) {
      // If path is relative, resolve against workspace
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (workspaceFolders && workspaceFolders.length > 0 && !path.isAbsolute(configPath)) {
        this.langPath = path.join(workspaceFolders[0].uri.fsPath, configPath);
      } else {
        this.langPath = configPath;
      }
    } else {
      // Auto-detect from workspace
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (workspaceFolders && workspaceFolders.length > 0) {
        this.langPath = path.join(workspaceFolders[0].uri.fsPath, 'src', 'lang');
      } else {
        this.langPath = '';
      }
    }
  }

  /**
   * Detect available languages by scanning JSON files in the lang directory.
   */
  private detectLanguagesFromFiles(): string[] {
    if (!this.langPath || !fs.existsSync(this.langPath)) {
      return [];
    }

    try {
      const files = fs.readdirSync(this.langPath);
      const languages = files
        .filter(file => file.endsWith('.json'))
        .map(file => path.basename(file, '.json'))
        .sort((a, b) => {
          // Put source language first
          if (a === this.sourceLanguage) return -1;
          if (b === this.sourceLanguage) return 1;
          return a.localeCompare(b);
        });

      console.log(`Detected ${languages.length} languages: ${languages.join(', ')}`);
      return languages;
    } catch (error) {
      console.error('Error detecting languages:', error);
      return [];
    }
  }

  public async initialize(): Promise<void> {
    this.updateConfiguration();
    this.availableLanguages = this.detectLanguagesFromFiles();
    await this.loadAllTranslations();
    this.setupFileWatcher();
  }

  private setupFileWatcher(): void {
    if (this.fileWatcher) {
      this.fileWatcher.dispose();
    }

    const pattern = new vscode.RelativePattern(this.langPath, '*.json');
    this.fileWatcher = vscode.workspace.createFileSystemWatcher(pattern);

    this.fileWatcher.onDidChange(() => this.reload());
    this.fileWatcher.onDidCreate(() => this.reload());
    this.fileWatcher.onDidDelete(() => this.reload());
  }

  private async reload(): Promise<void> {
    this.updateConfiguration();
    this.availableLanguages = this.detectLanguagesFromFiles();
    await this.loadAllTranslations();
    this.onDidChangeEmitter.fire();
  }

  private async loadAllTranslations(): Promise<void> {
    this.translations.clear();
    const allKeys = new Set<string>();

    for (const langCode of this.availableLanguages) {
      const filePath = path.join(this.langPath, `${langCode}.json`);

      try {
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf-8');
          const data = JSON.parse(content) as Record<string, string>;

          for (const [key, value] of Object.entries(data)) {
            allKeys.add(key);

            if (!this.translations.has(key)) {
              this.translations.set(key, {});
            }

            const entry = this.translations.get(key)!;
            entry[langCode] = value;
          }
        }
      } catch (error) {
        console.error(`Error loading ${langCode}.json:`, error);
      }
    }

    this.keys = Array.from(allKeys).sort();
    console.log(`Loaded ${this.keys.length} translation keys from ${this.availableLanguages.length} languages`);
  }

  public getAllKeys(): string[] {
    return this.keys;
  }

  /**
   * Get the list of detected/available languages.
   */
  public getAvailableLanguages(): string[] {
    return this.availableLanguages;
  }

  /**
   * Get the configured source language.
   */
  public getSourceLanguage(): string {
    return this.sourceLanguage;
  }

  /**
   * Get language info for a code, using custom languages from settings.
   */
  public getLanguageInfoForCode(langCode: string): LanguageInfo {
    return getLanguageInfo(langCode, this.customLanguages);
  }

  /**
   * Get custom languages configuration.
   */
  public getCustomLanguages(): Record<string, CustomLanguageConfig> {
    return this.customLanguages;
  }

  /**
   * Get the language files directory path.
   */
  public getLangPath(): string {
    return this.langPath;
  }

  /**
   * Get the full file path for a specific language.
   */
  public getFilePathForLanguage(langCode: string): string {
    return path.join(this.langPath, `${langCode}.json`);
  }

  /**
   * Find the line number of a key in a language file.
   * Returns 0-based line number, or -1 if not found.
   */
  public findKeyLineInFile(key: string, langCode: string): number {
    const filePath = this.getFilePathForLanguage(langCode);
    try {
      if (!fs.existsSync(filePath)) {
        return -1;
      }
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      const keyPattern = new RegExp(`^\\s*"${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"\\s*:`);
      for (let i = 0; i < lines.length; i++) {
        if (keyPattern.test(lines[i])) {
          return i;
        }
      }
    } catch (error) {
      console.error(`Error finding key in ${langCode}.json:`, error);
    }
    return -1;
  }

  public getTranslation(key: string, langCode: string): string | undefined {
    return this.translations.get(key)?.[langCode];
  }

  public getAllTranslations(key: string): Record<string, string> | undefined {
    return this.translations.get(key);
  }

  public keyExists(key: string): boolean {
    return this.translations.has(key);
  }

  public searchKeys(query: string): string[] {
    const lowerQuery = query.toLowerCase();
    return this.keys.filter(key =>
      key.toLowerCase().includes(lowerQuery) ||
      this.getTranslation(key, this.sourceLanguage)?.toLowerCase().includes(lowerQuery)
    );
  }

  public async addTranslation(key: string, translations: Record<string, string>): Promise<void> {
    for (const langCode of this.availableLanguages) {
      const filePath = path.join(this.langPath, `${langCode}.json`);

      try {
        let data: Record<string, string> = {};

        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf-8');
          data = JSON.parse(content);
        }

        // Add new key at the end without sorting
        data[key] = translations[langCode] || translations[this.sourceLanguage] || '';

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
      } catch (error) {
        console.error(`Error writing to ${langCode}.json:`, error);
        throw error;
      }
    }

    await this.reload();
  }

  public getFormattedPreview(key: string): string {
    const translations = this.getAllTranslations(key);
    if (!translations) {
      return `Key "${key}" not found`;
    }

    let markdown = `**${key}**\n\n`;
    markdown += '| Language | Translation |\n';
    markdown += '|----------|-------------|\n';

    for (const langCode of this.availableLanguages) {
      const info = this.getLanguageInfoForCode(langCode);
      const value = translations[langCode] || '-';
      markdown += `| ${info.flag} ${info.name} | ${value} |\n`;
    }

    return markdown;
  }

  public dispose(): void {
    if (this.fileWatcher) {
      this.fileWatcher.dispose();
    }
    this.onDidChangeEmitter.dispose();
  }
}
