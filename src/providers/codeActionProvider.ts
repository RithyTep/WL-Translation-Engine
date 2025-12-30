import * as vscode from 'vscode';
import { TranslationStore } from '../services/translationStore';
import { MyMemoryApi, TranslationContext } from '../services/myMemoryApi';
import { keyToReadableText } from '../utils/keyTransform';

export class TranslationCodeActionProvider implements vscode.CodeActionProvider {
  private store: TranslationStore;
  private api: MyMemoryApi;

  public static readonly providedCodeActionKinds = [
    vscode.CodeActionKind.QuickFix,
    vscode.CodeActionKind.RefactorExtract
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
    const actions: vscode.CodeAction[] = [];

    // Check for missing translation keys (QuickFix)
    const missingKeyActions = this.getMissingKeyActions(document, range);
    actions.push(...missingKeyActions);

    // Check for text extraction (RefactorExtract)
    const extractAction = this.getExtractAction(document, range);
    if (extractAction) {
      actions.push(extractAction);
    }

    return actions;
  }

  private getMissingKeyActions(document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction[] {
    const line = document.lineAt(range.start.line);
    const lineText = line.text;
    const actions: vscode.CodeAction[] = [];

    // Find all $t('key') patterns in the line
    const patterns = [
      /\$t\(['"]([^'"]+)['"]\)/g,
      /\bt\(['"]([^'"]+)['"]\)/g,
      /i18n\.t\(['"]([^'"]+)['"]\)/g
    ];

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

  private getExtractAction(document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction | undefined {
    // Only show extract action if there's a selection
    if (range.isEmpty) {
      return undefined;
    }

    const selectedText = document.getText(range).trim();

    // Skip if selection is empty or too long
    if (!selectedText || selectedText.length > 200) {
      return undefined;
    }

    // Skip if selection contains newlines (multi-line selection)
    if (selectedText.includes('\n')) {
      return undefined;
    }

    // Check if selection is already inside a $t() call
    const line = document.lineAt(range.start.line);
    const lineText = line.text;

    const patterns = [
      /\$t\(['"]([^'"]+)['"]\)/g,
      /\bt\(['"]([^'"]+)['"]\)/g,
      /i18n\.t\(['"]([^'"]+)['"]\)/g
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(lineText)) !== null) {
        const matchStart = match.index;
        const matchEnd = matchStart + match[0].length;

        // If selection is inside a translation call, don't offer extract
        if (range.start.character >= matchStart && range.end.character <= matchEnd) {
          return undefined;
        }
      }
    }

    // Create extract action
    const action = new vscode.CodeAction(
      `Extract to translation`,
      vscode.CodeActionKind.RefactorExtract
    );

    action.command = {
      command: 'kirby-i18n.extractToTranslation',
      title: 'Extract to Translation',
      arguments: [document.uri, range, selectedText]
    };

    return action;
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
      arguments: [key, keyToReadableText(key)] // key and readable English text
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
  if (store.keyExists(key)) {
    vscode.window.showInformationMessage(`Key "${key}" already exists!`);
    return;
  }

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

        await store.addTranslation(key, translations);

        progress.report({ message: 'Saving to files...' });

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

  // Register the extract to translation command
  const extractCommand = vscode.commands.registerCommand(
    'kirby-i18n.extractToTranslation',
    async (uri: vscode.Uri, range: vscode.Range, selectedText: string) => {
      await extractToTranslationCommand(store, api, uri, range, selectedText);
    }
  );
  context.subscriptions.push(extractCommand);
}

async function extractToTranslationCommand(
  store: TranslationStore,
  api: MyMemoryApi,
  uri: vscode.Uri,
  range: vscode.Range,
  selectedText: string
): Promise<void> {
  // Prompt for key name
  const suggestedKey = selectedText
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 30);

  const key = await vscode.window.showInputBox({
    prompt: 'Enter translation key',
    placeHolder: 'e.g., welcome_message',
    value: suggestedKey,
    validateInput: (value) => {
      if (!value || !value.trim()) {
        return 'Key cannot be empty';
      }
      if (store.keyExists(value.trim())) {
        return `Key "${value}" already exists`;
      }
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value.trim())) {
        return 'Key must start with a letter or underscore and contain only alphanumeric characters';
      }
      return null;
    }
  });

  if (!key) {
    return;
  }

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
      title: `Extracting "${key}"...`,
      cancellable: false
    },
    async (progress) => {
      try {
        // Translate to all languages
        const context: TranslationContext = {
          sourceLanguage,
          targetLanguages: availableLanguages,
          customLanguages: store.getCustomLanguages()
        };

        const translations = await api.translateToAllLanguages(
          selectedText,
          context,
          (lang, current, total) => {
            const langInfo = store.getLanguageInfoForCode(lang);
            progress.report({
              message: `${langInfo.flag} ${langInfo.name} (${current}/${total})`,
              increment: (1 / total) * 100
            });
          }
        );

        progress.report({ message: 'Saving translations...' });

        // Save to language files
        await store.addTranslation(key, translations);

        progress.report({ message: 'Replacing text...' });

        // Replace selected text with $t() call
        const editor = await vscode.window.showTextDocument(uri);
        const document = editor.document;

        // Determine format based on context
        const isVueTemplate = document.languageId === 'vue' &&
          isInTemplateSection(document, range.start);

        const replacement = isVueTemplate
          ? `{{ $t('${key}') }}`
          : `$t('${key}')`;

        await editor.edit(editBuilder => {
          editBuilder.replace(range, replacement);
        });

        const langCount = availableLanguages.length;
        vscode.window.showInformationMessage(
          `Extracted "${key}" to ${langCount} language file${langCount !== 1 ? 's' : ''}!`
        );

      } catch (error) {
        vscode.window.showErrorMessage(
          `Failed to extract translation: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
  );
}

function isInTemplateSection(document: vscode.TextDocument, position: vscode.Position): boolean {
  const text = document.getText();
  const offset = document.offsetAt(position);

  const templateStart = text.indexOf('<template');
  const templateEnd = text.indexOf('</template>');

  if (templateStart === -1 || templateEnd === -1) {
    return false;
  }

  return offset >= templateStart && offset <= templateEnd + '</template>'.length;
}
