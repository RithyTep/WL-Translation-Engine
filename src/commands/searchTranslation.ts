import * as vscode from 'vscode';
import { TranslationStore } from '../services/translationStore';

interface TranslationQuickPickItem extends vscode.QuickPickItem {
  key: string;
}

export async function searchTranslationCommand(store: TranslationStore): Promise<void> {
  const quickPick = vscode.window.createQuickPick<TranslationQuickPickItem>();
  quickPick.placeholder = 'Search translation keys...';
  quickPick.matchOnDescription = true;
  quickPick.matchOnDetail = true;

  const allKeys = store.getAllKeys();
  const items: TranslationQuickPickItem[] = allKeys.slice(0, 200).map(key => {
    const englishText = store.getTranslation(key, 'en') || '';
    return {
      label: key,
      description: englishText.length > 60 ? englishText.substring(0, 60) + '...' : englishText,
      key: key
    };
  });

  quickPick.items = items;

  quickPick.onDidChangeValue(value => {
    if (value) {
      const filtered = store.searchKeys(value).slice(0, 200).map(key => {
        const englishText = store.getTranslation(key, 'en') || '';
        return {
          label: key,
          description: englishText.length > 60 ? englishText.substring(0, 60) + '...' : englishText,
          key: key
        };
      });
      quickPick.items = filtered;
    } else {
      quickPick.items = items;
    }
  });

  quickPick.onDidAccept(() => {
    const selected = quickPick.selectedItems[0];
    if (selected) {
      insertTranslation(selected.key);
    }
    quickPick.hide();
  });

  quickPick.onDidHide(() => quickPick.dispose());

  quickPick.show();
}

function insertTranslation(key: string): void {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    vscode.env.clipboard.writeText(`{{ $t('${key}') }}`);
    vscode.window.showInformationMessage(`Copied {{ $t('${key}') }} to clipboard`);
    return;
  }

  const document = editor.document;
  const isVueTemplate = document.languageId === 'vue' &&
    isInTemplateSection(document, editor.selection.active);

  const insertText = isVueTemplate
    ? `{{ $t('${key}') }}`
    : `$t('${key}')`;

  editor.edit(editBuilder => {
    if (editor.selection.isEmpty) {
      editBuilder.insert(editor.selection.active, insertText);
    } else {
      editBuilder.replace(editor.selection, insertText);
    }
  });
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

export function registerSearchTranslationCommand(
  context: vscode.ExtensionContext,
  store: TranslationStore
): void {
  const disposable = vscode.commands.registerCommand(
    'kirby-i18n.searchKey',
    () => searchTranslationCommand(store)
  );
  context.subscriptions.push(disposable);
}
