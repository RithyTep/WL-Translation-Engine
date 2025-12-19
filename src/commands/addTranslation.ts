import * as vscode from 'vscode';
import { TranslationStore } from '../services/translationStore';
import { MyMemoryApi, TranslationContext } from '../services/myMemoryApi';

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

  const sourceInfo = store.getLanguageInfoForCode(sourceLanguage);
  const sourceText = await vscode.window.showInputBox({
    prompt: `Enter the ${sourceInfo.name} text`,
    placeHolder: 'e.g., Welcome to our application',
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
