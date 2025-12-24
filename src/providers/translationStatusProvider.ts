import * as vscode from 'vscode';
import { TranslationStore } from '../services/translationStore';
import { MyMemoryApi, TranslationContext } from '../services/myMemoryApi';
import { keyToReadableText } from '../utils/keyTransform';

interface LanguageStats {
  langCode: string;
  name: string;
  flag: string;
  totalKeys: number;
  translatedKeys: number;
  missingKeys: string[];
}

export class TranslationStatusProvider implements vscode.TreeDataProvider<TranslationTreeItem> {
  private store: TranslationStore;
  private _onDidChangeTreeData: vscode.EventEmitter<TranslationTreeItem | undefined | null | void> =
    new vscode.EventEmitter<TranslationTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<TranslationTreeItem | undefined | null | void> =
    this._onDidChangeTreeData.event;

  constructor(store: TranslationStore) {
    this.store = store;

    // Refresh tree when translations change
    store.onDidChange(() => {
      this.refresh();
    });
  }

  public refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  public getTreeItem(element: TranslationTreeItem): vscode.TreeItem {
    return element;
  }

  public getChildren(element?: TranslationTreeItem): Thenable<TranslationTreeItem[]> {
    if (!element) {
      // Root level: show languages
      return Promise.resolve(this.getLanguageItems());
    }

    if (element.contextValue === 'language') {
      // Language level: show missing keys
      return Promise.resolve(this.getMissingKeyItems(element.langCode!));
    }

    return Promise.resolve([]);
  }

  private getLanguageItems(): TranslationTreeItem[] {
    const languages = this.store.getAvailableLanguages();
    const allKeys = this.store.getAllKeys();
    const sourceLanguage = this.store.getSourceLanguage();
    const items: TranslationTreeItem[] = [];

    for (const langCode of languages) {
      const stats = this.calculateLanguageStats(langCode, allKeys);
      const langInfo = this.store.getLanguageInfoForCode(langCode);

      const percentage = stats.totalKeys > 0
        ? Math.round((stats.translatedKeys / stats.totalKeys) * 100)
        : 100;

      const statusIcon = this.getStatusIcon(percentage);
      const isSource = langCode === sourceLanguage;
      const sourceLabel = isSource ? ' (source)' : '';

      const label = `${langInfo.flag} ${langInfo.name}${sourceLabel}`;
      const description = `${percentage}% ${statusIcon}`;

      const collapsibleState = stats.missingKeys.length > 0
        ? vscode.TreeItemCollapsibleState.Collapsed
        : vscode.TreeItemCollapsibleState.None;

      const item = new TranslationTreeItem(
        label,
        collapsibleState,
        'language',
        langCode,
        description
      );

      item.tooltip = this.createLanguageTooltip(stats, langInfo.name, percentage);

      if (stats.missingKeys.length === 0) {
        item.iconPath = new vscode.ThemeIcon('check', new vscode.ThemeColor('charts.green'));
      } else if (percentage >= 80) {
        item.iconPath = new vscode.ThemeIcon('circle-large-outline', new vscode.ThemeColor('charts.yellow'));
      } else {
        item.iconPath = new vscode.ThemeIcon('warning', new vscode.ThemeColor('charts.orange'));
      }

      items.push(item);
    }

    // Sort: source language first, then by completion percentage (descending)
    items.sort((a, b) => {
      if (a.langCode === sourceLanguage) return -1;
      if (b.langCode === sourceLanguage) return 1;

      const aPercent = this.extractPercentage(a.description || '');
      const bPercent = this.extractPercentage(b.description || '');
      return bPercent - aPercent;
    });

    return items;
  }

  private getMissingKeyItems(langCode: string): TranslationTreeItem[] {
    const allKeys = this.store.getAllKeys();
    const stats = this.calculateLanguageStats(langCode, allKeys);

    return stats.missingKeys.map(key => {
      const item = new TranslationTreeItem(
        key,
        vscode.TreeItemCollapsibleState.None,
        'missingKey',
        langCode,
        undefined,
        key
      );

      item.iconPath = new vscode.ThemeIcon('warning', new vscode.ThemeColor('charts.orange'));
      item.tooltip = `Click to add translation for "${key}"\nRight-click for more options`;
      item.command = {
        command: 'kirby-i18n.addMissingTranslation',
        title: 'Add Translation',
        arguments: [key, langCode]
      };

      return item;
    });
  }

  private calculateLanguageStats(langCode: string, allKeys: string[]): LanguageStats {
    const langInfo = this.store.getLanguageInfoForCode(langCode);
    const missingKeys: string[] = [];
    let translatedKeys = 0;

    for (const key of allKeys) {
      const translations = this.store.getAllTranslations(key);
      const value = translations?.[langCode];
      if (value && typeof value === 'string' && value.trim() !== '') {
        translatedKeys++;
      } else {
        missingKeys.push(key);
      }
    }

    return {
      langCode,
      name: langInfo.name,
      flag: langInfo.flag,
      totalKeys: allKeys.length,
      translatedKeys,
      missingKeys
    };
  }

  private getStatusIcon(percentage: number): string {
    if (percentage === 100) return '';
    if (percentage >= 80) return '';
    if (percentage >= 50) return '';
    return '';
  }

  private createLanguageTooltip(stats: LanguageStats, name: string, percentage: number): string {
    const lines = [
      `${name}: ${percentage}% complete`,
      `Translated: ${stats.translatedKeys}/${stats.totalKeys} keys`
    ];

    if (stats.missingKeys.length > 0) {
      lines.push(`Missing: ${stats.missingKeys.length} key${stats.missingKeys.length !== 1 ? 's' : ''}`);
    }

    return lines.join('\n');
  }

  private extractPercentage(description: string): number {
    const match = description.match(/(\d+)%/);
    return match ? parseInt(match[1], 10) : 0;
  }
}

export class TranslationTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly contextValue: string,
    public readonly langCode?: string,
    public readonly description?: string,
    public readonly keyName?: string
  ) {
    super(label, collapsibleState);
  }
}

export function registerTranslationStatusProvider(
  context: vscode.ExtensionContext,
  store: TranslationStore,
  api: MyMemoryApi
): TranslationStatusProvider {
  const provider = new TranslationStatusProvider(store);

  const treeView = vscode.window.createTreeView('kirby-i18n.translationStatus', {
    treeDataProvider: provider,
    showCollapseAll: true
  });

  context.subscriptions.push(treeView);

  // Register refresh command
  const refreshCommand = vscode.commands.registerCommand(
    'kirby-i18n.refreshTranslationStatus',
    () => provider.refresh()
  );
  context.subscriptions.push(refreshCommand);

  // Register go to key command
  const goToKeyCommand = vscode.commands.registerCommand(
    'kirby-i18n.goToKey',
    async (key: string) => {
      const sourceLanguage = store.getSourceLanguage();
      const filePath = store.getFilePathForLanguage(sourceLanguage);
      const lineNumber = store.findKeyLineInFile(key, sourceLanguage);

      if (lineNumber >= 0) {
        const uri = vscode.Uri.file(filePath);
        const doc = await vscode.workspace.openTextDocument(uri);
        const editor = await vscode.window.showTextDocument(doc);

        const position = new vscode.Position(lineNumber, 0);
        editor.selection = new vscode.Selection(position, position);
        editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);
      }
    }
  );
  context.subscriptions.push(goToKeyCommand);

  // Register add missing translation command (inline click)
  const addMissingCommand = vscode.commands.registerCommand(
    'kirby-i18n.addMissingTranslation',
    async (key: string, _langCode?: string) => {
      const availableLanguages = store.getAvailableLanguages();
      const sourceLanguage = store.getSourceLanguage();

      if (availableLanguages.length === 0) {
        vscode.window.showWarningMessage('No language files detected.');
        return;
      }

      const suggestedText = keyToReadableText(key);

      const sourceInfo = store.getLanguageInfoForCode(sourceLanguage);
      const sourceText = await vscode.window.showInputBox({
        prompt: `Enter ${sourceInfo.name} text for "${key}"`,
        value: suggestedText,
        placeHolder: 'e.g., Welcome message'
      });

      if (!sourceText) {
        return;
      }

      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: `Adding "${key}"...`,
          cancellable: false
        },
        async (progress) => {
          try {
            const translationContext: TranslationContext = {
              sourceLanguage,
              targetLanguages: availableLanguages,
              customLanguages: store.getCustomLanguages()
            };

            const translations = await api.translateToAllLanguages(
              sourceText,
              translationContext,
              (lang, current, total) => {
                const langInfo = store.getLanguageInfoForCode(lang);
                progress.report({
                  message: `${langInfo.flag} ${langInfo.name} (${current}/${total})`,
                  increment: (1 / total) * 100
                });
              }
            );

            await store.addTranslation(key, translations);
            provider.refresh();

            vscode.window.showInformationMessage(
              `Translation "${key}" added to ${availableLanguages.length} language files!`
            );
          } catch (error) {
            vscode.window.showErrorMessage(
              `Failed: ${error instanceof Error ? error.message : String(error)}`
            );
          }
        }
      );
    }
  );
  context.subscriptions.push(addMissingCommand);

  // Register add all missing for language command (bulk)
  const addAllMissingCommand = vscode.commands.registerCommand(
    'kirby-i18n.addAllMissingForLanguage',
    async (item: TranslationTreeItem) => {
      if (!item.langCode) {
        return;
      }

      const allKeys = store.getAllKeys();
      const missingKeys: string[] = [];

      for (const key of allKeys) {
        const translations = store.getAllTranslations(key);
        const value = translations?.[item.langCode];
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          missingKeys.push(key);
        }
      }

      if (missingKeys.length === 0) {
        vscode.window.showInformationMessage('No missing translations for this language!');
        return;
      }

      const langInfo = store.getLanguageInfoForCode(item.langCode);
      const confirm = await vscode.window.showInformationMessage(
        `Add ${missingKeys.length} missing translations for ${langInfo.flag} ${langInfo.name}?`,
        { modal: true },
        'Add All'
      );

      if (confirm !== 'Add All') {
        return;
      }

      const availableLanguages = store.getAvailableLanguages();
      const sourceLanguage = store.getSourceLanguage();

      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: `Adding ${missingKeys.length} translations...`,
          cancellable: false
        },
        async (progress) => {
          try {
            for (let i = 0; i < missingKeys.length; i++) {
              const key = missingKeys[i];
              const readableText = keyToReadableText(key);

              progress.report({
                message: `[${i + 1}/${missingKeys.length}] "${key}"`,
                increment: 0
              });

              const translationContext: TranslationContext = {
                sourceLanguage,
                targetLanguages: availableLanguages,
                customLanguages: store.getCustomLanguages()
              };

              const translations = await api.translateToAllLanguages(
                readableText,
                translationContext,
                (lang, current, total) => {
                  const langInfoProgress = store.getLanguageInfoForCode(lang);
                  progress.report({
                    message: `[${i + 1}/${missingKeys.length}] ${langInfoProgress.flag} (${current}/${total})`,
                    increment: (1 / (missingKeys.length * total)) * 100
                  });
                }
              );

              await store.addTranslation(key, translations);
            }

            provider.refresh();
            vscode.window.showInformationMessage(
              `${missingKeys.length} translations added!`
            );
          } catch (error) {
            vscode.window.showErrorMessage(
              `Failed: ${error instanceof Error ? error.message : String(error)}`
            );
          }
        }
      );
    }
  );
  context.subscriptions.push(addAllMissingCommand);

  // Register copy key command
  const copyKeyCommand = vscode.commands.registerCommand(
    'kirby-i18n.copyKey',
    async (item: TranslationTreeItem) => {
      const key = item.keyName || item.label;
      await vscode.env.clipboard.writeText(`$t('${key}')`);
      vscode.window.showInformationMessage(`Copied: $t('${key}')`);
    }
  );
  context.subscriptions.push(copyKeyCommand);

  // Register delete key command
  const deleteKeyCommand = vscode.commands.registerCommand(
    'kirby-i18n.deleteKey',
    async (item: TranslationTreeItem) => {
      const key = item.keyName || item.label;

      const confirm = await vscode.window.showWarningMessage(
        `Delete "${key}" from all language files?`,
        { modal: true },
        'Delete'
      );

      if (confirm !== 'Delete') {
        return;
      }

      try {
        await store.deleteTranslation(key);
        provider.refresh();
        vscode.window.showInformationMessage(`Deleted "${key}" from all language files.`);
      } catch (error) {
        vscode.window.showErrorMessage(
          `Failed to delete: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
  );
  context.subscriptions.push(deleteKeyCommand);

  return provider;
}
