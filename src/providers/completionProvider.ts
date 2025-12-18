import * as vscode from 'vscode';
import { TranslationStore } from '../services/translationStore';

export class TranslationCompletionProvider implements vscode.CompletionItemProvider {
  private store: TranslationStore;

  constructor(store: TranslationStore) {
    this.store = store;
  }

  public provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken,
    _context: vscode.CompletionContext
  ): vscode.CompletionItem[] | undefined {
    const lineText = document.lineAt(position).text;
    const textBeforeCursor = lineText.substring(0, position.character);

    const patterns = [
      /\$t\(['"]([^'"]*)?$/,
      /\bt\(['"]([^'"]*)?$/,
      /\$t\(\s*['"]([^'"]*)?$/,
      /\bt\(\s*['"]([^'"]*)?$/,
      /i18n\.t\(['"]([^'"]*)?$/
    ];

    let match: RegExpMatchArray | null = null;
    for (const pattern of patterns) {
      match = textBeforeCursor.match(pattern);
      if (match) {
        break;
      }
    }

    if (!match) {
      return undefined;
    }

    const searchQuery = match[1] || '';
    const keys = searchQuery
      ? this.store.searchKeys(searchQuery)
      : this.store.getAllKeys();

    return keys.slice(0, 100).map((key, index) => {
      const item = new vscode.CompletionItem(key, vscode.CompletionItemKind.Text);

      const englishText = this.store.getTranslation(key, 'en') || '';
      item.detail = englishText.length > 50 ? englishText.substring(0, 50) + '...' : englishText;

      item.documentation = new vscode.MarkdownString(this.store.getFormattedPreview(key));

      item.sortText = index.toString().padStart(5, '0');

      item.insertText = key;

      return item;
    });
  }
}

export function registerCompletionProvider(
  context: vscode.ExtensionContext,
  store: TranslationStore
): void {
  const provider = new TranslationCompletionProvider(store);

  const languages = ['vue', 'typescript', 'javascript', 'typescriptreact', 'javascriptreact'];

  for (const language of languages) {
    const disposable = vscode.languages.registerCompletionItemProvider(
      { language, scheme: 'file' },
      provider,
      "'", '"', '('
    );
    context.subscriptions.push(disposable);
  }
}
