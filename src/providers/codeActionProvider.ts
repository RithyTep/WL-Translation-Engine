import * as vscode from 'vscode';
import { TranslationStore } from '../services/translationStore';
import { MyMemoryApi, TranslationContext } from '../services/myMemoryApi';

export class TranslationCodeActionProvider implements vscode.CodeActionProvider {
  private store: TranslationStore;
  private api: MyMemoryApi;

  public static readonly providedCodeActionKinds = [
    vscode.CodeActionKind.QuickFix
  ];

  constructor(store: TranslationStore, api: MyMemoryApi) {
    this.store = store;
    this.api = api;
  }

  public provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range,
    _context: vscode.CodeActionContext,
    _token: vscode.CancellationToken
  ): vscode.CodeAction[] | undefined {
    const line = document.lineAt(range.start.line);
    const lineText = line.text;

    // Find all $t('key') patterns in the line
    const patterns = [
      /\$t\(['"]([^'"]+)['"]\)/g,
      /\bt\(['"]([^'"]+)['"]\)/g,
      /i18n\.t\(['"]([^'"]+)['"]\)/g
    ];

    const actions: vscode.CodeAction[] = [];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(lineText)) !== null) {
        const key = match[1];
        const keyStart = match.index + match[0].indexOf(key);
        const keyEnd = keyStart + key.length;

        // Check if cursor is on this key
        if (range.start.character >= keyStart && range.start.character <= keyEnd) {
          // Check if key doesn't exist
          if (!this.store.keyExists(key)) {
            const action = this.createAddTranslationAction(document, key);
            if (action) {
              actions.push(action);
            }
          }
        }
      }
    }

    return actions;
  }

  private createAddTranslationAction(
    document: vscode.TextDocument,
    key: string
  ): vscode.CodeAction | undefined {
    const action = new vscode.CodeAction(
      `Add translation: "${key}"`,
      vscode.CodeActionKind.QuickFix
    );

    action.command = {
      command: 'kirby-i18n.addTranslationQuick',
      title: 'Add Translation',
      arguments: [key, key] // key and default value (same as key)
    };

    action.isPreferred = true;

    return action;
  }
}

export async function addTranslationQuickCommand(
  store: TranslationStore,
  api: MyMemoryApi,
  key: string,
  defaultValue: string
): Promise<void> {
  const availableLanguages = store.getAvailableLanguages();
  const sourceLanguage = store.getSourceLanguage();

  if (availableLanguages.length === 0) {
    vscode.window.showWarningMessage(
      'No language files detected. Please create at least one .json file in the language directory.'
    );
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
        const context: TranslationContext = {
          sourceLanguage,
          targetLanguages: availableLanguages,
          customLanguages: store.getCustomLanguages()
        };

        const translations = await api.translateToAllLanguages(
          defaultValue,
          context,
          (lang, current, total) => {
            const langInfo = store.getLanguageInfoForCode(lang);
            progress.report({
              message: `${langInfo.flag} ${langInfo.name} (${current}/${total})`,
              increment: (1 / total) * 100
            });
          }
        );

        progress.report({ message: 'Saving to files...' });

        await store.addTranslation(key, translations);

        const langCount = availableLanguages.length;
        vscode.window.showInformationMessage(
          `Translation "${key}" added to ${langCount} language file${langCount !== 1 ? 's' : ''}!`
        );

      } catch (error) {
        vscode.window.showErrorMessage(
          `Failed to add translation: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
  );
}

export function registerCodeActionProvider(
  context: vscode.ExtensionContext,
  store: TranslationStore,
  api: MyMemoryApi
): void {
  const provider = new TranslationCodeActionProvider(store, api);

  const languages = ['vue', 'typescript', 'javascript', 'typescriptreact', 'javascriptreact'];

  for (const language of languages) {
    const disposable = vscode.languages.registerCodeActionsProvider(
      { language, scheme: 'file' },
      provider,
      {
        providedCodeActionKinds: TranslationCodeActionProvider.providedCodeActionKinds
      }
    );
    context.subscriptions.push(disposable);
  }

  // Register the quick add command
  const commandDisposable = vscode.commands.registerCommand(
    'kirby-i18n.addTranslationQuick',
    (key: string, defaultValue: string) => addTranslationQuickCommand(store, api, key, defaultValue)
  );
  context.subscriptions.push(commandDisposable);
}
