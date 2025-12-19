import * as vscode from 'vscode';
import { TranslationStore } from './services/translationStore';
import { MyMemoryApi } from './services/myMemoryApi';
import { registerCompletionProvider } from './providers/completionProvider';
import { registerHoverProvider } from './providers/hoverProvider';
import { registerCodeActionProvider } from './providers/codeActionProvider';
import { registerAddTranslationCommand } from './commands/addTranslation';
import { registerSearchTranslationCommand } from './commands/searchTranslation';

let translationStore: TranslationStore | undefined;

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  console.log('Kirby i18n extension is now active!');

  translationStore = new TranslationStore();
  const myMemoryApi = new MyMemoryApi();

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Window,
      title: 'Loading translations...'
    },
    async () => {
      await translationStore!.initialize();
    }
  );

  const keyCount = translationStore.getAllKeys().length;
  const langCount = translationStore.getAvailableLanguages().length;
  vscode.window.showInformationMessage(
    `Kirby i18n: Loaded ${keyCount} keys from ${langCount} languages`
  );

  registerCompletionProvider(context, translationStore);
  registerHoverProvider(context, translationStore);
  registerCodeActionProvider(context, translationStore, myMemoryApi);
  registerAddTranslationCommand(context, translationStore, myMemoryApi);
  registerSearchTranslationCommand(context, translationStore);

  const refreshCommand = vscode.commands.registerCommand(
    'kirby-i18n.refresh',
    async () => {
      await translationStore!.initialize();
      const count = translationStore!.getAllKeys().length;
      const langs = translationStore!.getAvailableLanguages().length;
      vscode.window.showInformationMessage(
        `Kirby i18n: Refreshed ${count} keys from ${langs} languages`
      );
    }
  );
  context.subscriptions.push(refreshCommand);

  context.subscriptions.push({
    dispose: () => {
      if (translationStore) {
        translationStore.dispose();
      }
    }
  });
}

export function deactivate(): void {
  if (translationStore) {
    translationStore.dispose();
  }
}
