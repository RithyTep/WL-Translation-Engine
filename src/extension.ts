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
  vscode.window.showInformationMessage(
    `Kirby i18n: Loaded ${keyCount} translation keys`
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
      vscode.window.showInformationMessage(
        `Kirby i18n: Refreshed ${count} translation keys`
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
