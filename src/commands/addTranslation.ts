import * as vscode from 'vscode';
import { TranslationStore } from '../services/translationStore';
import { MyMemoryApi } from '../services/myMemoryApi';
import { LANGUAGES } from '../utils/languageConfig';

export async function addTranslationCommand(
  store: TranslationStore,
  api: MyMemoryApi
): Promise<void> {
  const key = await vscode.window.showInputBox({
    prompt: 'Enter the translation key',
    placeHolder: 'e.g., welcome_message, user_profile',
    validateInput: (value) => {
      if (!value || !value.trim()) {
        return 'Key cannot be empty';
      }
      if (store.keyExists(value.trim())) {
        return `Key "${value}" already exists`;
      }
      return null;
    }
  });

  if (!key) {
    return;
  }

  const englishText = await vscode.window.showInputBox({
    prompt: 'Enter the English text',
    placeHolder: 'e.g., Welcome to our application',
    validateInput: (value) => {
      if (!value || !value.trim()) {
        return 'English text cannot be empty';
      }
      return null;
    }
  });

  if (!englishText) {
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
        const translations = await api.translateToAllLanguages(
          englishText,
          (lang, current, total) => {
            const langInfo = LANGUAGES[lang];
            progress.report({
              message: `${langInfo?.flag || ''} ${langInfo?.name || lang} (${current}/${total})`,
              increment: (1 / total) * 100
            });
          }
        );

        progress.report({ message: 'Saving to files...' });

        await store.addTranslation(key, translations);

        vscode.window.showInformationMessage(
          `Translation "${key}" added to all 13 language files!`,
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
