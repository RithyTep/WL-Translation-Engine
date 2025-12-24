import * as vscode from 'vscode';
import { TranslationStore } from '../services/translationStore';
import { MyMemoryApi, TranslationContext } from '../services/myMemoryApi';
import { keyToReadableText, parseCommaSeparatedKeys } from '../utils/keyTransform';

export async function addTranslationCommand(
  store: TranslationStore,
  api: MyMemoryApi
): Promise<void> {
  const availableLanguages = store.getAvailableLanguages();
  const sourceLanguage = store.getSourceLanguage();

  if (availableLanguages.length === 0) {
    vscode.window.showWarningMessage(
      'No language files detected. Please create at least one .json file in the language directory.'
    );
    return;
  }

  const keyInput = await vscode.window.showInputBox({
    prompt: 'Enter translation key(s) - use comma to separate multiple keys',
    placeHolder: 'e.g., welcome_message or key1, key2, key3',
    validateInput: (value) => {
      if (!value || !value.trim()) {
        return 'Key cannot be empty';
      }

      const keys = parseCommaSeparatedKeys(value);
      for (const key of keys) {
        if (store.keyExists(key.trim())) {
          return `Key "${key}" already exists`;
        }
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key.trim())) {
          return `Key "${key}" must start with a letter or underscore and contain only alphanumeric characters`;
        }
      }
      return null;
    }
  });

  if (!keyInput) {
    return;
  }

  const keys = parseCommaSeparatedKeys(keyInput);
  const isBatch = keys.length > 1;

  if (isBatch) {
    // Batch mode: auto-transform all keys
    await processBatchKeys(store, api, keys, availableLanguages, sourceLanguage);
  } else {
    // Single key mode: prompt for English text (with suggestion)
    await processSingleKey(store, api, keys[0], availableLanguages, sourceLanguage);
  }
}

async function processSingleKey(
  store: TranslationStore,
  api: MyMemoryApi,
  key: string,
  availableLanguages: string[],
  sourceLanguage: string
): Promise<void> {
  const sourceInfo = store.getLanguageInfoForCode(sourceLanguage);
  const suggestedText = keyToReadableText(key);

  const sourceText = await vscode.window.showInputBox({
    prompt: `Enter the ${sourceInfo.name} text`,
    placeHolder: 'e.g., Welcome to our application',
    value: suggestedText, // Pre-fill with transformed key
    validateInput: (value) => {
      if (!value || !value.trim()) {
        return `${sourceInfo.name} text cannot be empty`;
      }
      return null;
    }
  });

  if (!sourceText) {
    return;
  }

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'Translating...',
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
          sourceText,
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
          `Translation "${key}" added to ${langCount} language file${langCount !== 1 ? 's' : ''}!`,
          'Copy Usage'
        ).then(selection => {
          if (selection === 'Copy Usage') {
            vscode.env.clipboard.writeText(`{{ $t('${key}') }}`);
            vscode.window.showInformationMessage('Copied to clipboard!');
          }
        });

      } catch (error) {
        vscode.window.showErrorMessage(
          `Failed to add translation: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
  );
}

async function processBatchKeys(
  store: TranslationStore,
  api: MyMemoryApi,
  keys: string[],
  availableLanguages: string[],
  sourceLanguage: string
): Promise<void> {
  // Show preview of transformations
  const preview = keys.map(k => `  "${k}" → "${keyToReadableText(k)}"`).join('\n');

  const proceed = await vscode.window.showInformationMessage(
    `Add ${keys.length} translations?\n\n${preview}`,
    { modal: true },
    'Add All'
  );

  if (proceed !== 'Add All') {
    return;
  }

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: `Adding ${keys.length} translations...`,
      cancellable: false
    },
    async (progress) => {
      try {
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          const readableText = keyToReadableText(key);

          progress.report({
            message: `Key ${i + 1}/${keys.length}: "${key}"`,
            increment: 0
          });

          const context: TranslationContext = {
            sourceLanguage,
            targetLanguages: availableLanguages,
            customLanguages: store.getCustomLanguages()
          };

          const translations = await api.translateToAllLanguages(
            readableText,
            context,
            (lang, current, total) => {
              const langInfo = store.getLanguageInfoForCode(lang);
              progress.report({
                message: `[${i + 1}/${keys.length}] ${langInfo.flag} ${langInfo.name} (${current}/${total})`,
                increment: (1 / (keys.length * total)) * 100
              });
            }
          );

          await store.addTranslation(key, translations);
        }

        progress.report({ message: 'Saving to files...' });

        const langCount = availableLanguages.length;
        vscode.window.showInformationMessage(
          `${keys.length} translations added to ${langCount} language file${langCount !== 1 ? 's' : ''}!`
        );

      } catch (error) {
        vscode.window.showErrorMessage(
          `Failed to add translations: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
  );
}

export function registerAddTranslationCommand(
  context: vscode.ExtensionContext,
  store: TranslationStore,
  api: MyMemoryApi
): void {
  const disposable = vscode.commands.registerCommand(
    'kirby-i18n.addTranslation',
    () => addTranslationCommand(store, api)
  );
  context.subscriptions.push(disposable);
}
