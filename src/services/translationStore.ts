import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { LANGUAGE_ORDER, getLanguageInfo } from '../utils/languageConfig';

export interface TranslationEntry {
  key: string;
  translations: Record<string, string>;
}

export class TranslationStore {
  private translations: Map<string, Record<string, string>> = new Map();
  private keys: string[] = [];
  private langPath: string = '';
  private fileWatcher: vscode.FileSystemWatcher | undefined;
  private onDidChangeEmitter = new vscode.EventEmitter<void>();
  public onDidChange = this.onDidChangeEmitter.event;

  constructor() {
    this.updateLangPath();
  }

  private updateLangPath(): void {
    const config = vscode.workspace.getConfiguration('kirby-i18n');
    const configPath = config.get<string>('langPath');

    if (configPath && configPath.trim()) {
      this.langPath = configPath;
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

  public async initialize(): Promise<void> {
    this.updateLangPath();
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
    await this.loadAllTranslations();
    this.onDidChangeEmitter.fire();
  }

  private async loadAllTranslations(): Promise<void> {
    this.translations.clear();
    const allKeys = new Set<string>();

    for (const langCode of LANGUAGE_ORDER) {
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
    console.log(`Loaded ${this.keys.length} translation keys`);
  }

  public getAllKeys(): string[] {
    return this.keys;
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
      this.getTranslation(key, 'en')?.toLowerCase().includes(lowerQuery)
    );
  }

  public async addTranslation(key: string, translations: Record<string, string>): Promise<void> {
    for (const langCode of LANGUAGE_ORDER) {
      const filePath = path.join(this.langPath, `${langCode}.json`);

      try {
        let data: Record<string, string> = {};

        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf-8');
          data = JSON.parse(content);
        }

        // Add new key at the end without sorting
        data[key] = translations[langCode] || translations['en'] || '';

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

    for (const langCode of LANGUAGE_ORDER) {
      const info = getLanguageInfo(langCode);
      const value = translations[langCode] || '-';
      if (info) {
        markdown += `| ${info.flag} ${info.name} | ${value} |\n`;
      }
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
