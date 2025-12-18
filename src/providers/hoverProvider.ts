import * as vscode from 'vscode';
import { TranslationStore } from '../services/translationStore';

export class TranslationHoverProvider implements vscode.HoverProvider {
  private store: TranslationStore;

  constructor(store: TranslationStore) {
    this.store = store;
  }

  public provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken
  ): vscode.Hover | undefined {
    const range = this.getTranslationKeyRange(document, position);

    if (!range) {
      return undefined;
    }

    const key = document.getText(range);

    if (!this.store.keyExists(key)) {
      const markdown = new vscode.MarkdownString();
      markdown.appendMarkdown(`**Translation key not found:** \`${key}\`\n\n`);
      markdown.appendMarkdown('_Click to add this translation_');
      return new vscode.Hover(markdown, range);
    }

    const markdown = new vscode.MarkdownString(this.store.getFormattedPreview(key));
    markdown.isTrusted = true;

    return new vscode.Hover(markdown, range);
  }

  private getTranslationKeyRange(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.Range | undefined {
    const line = document.lineAt(position);
    const lineText = line.text;

    const patterns = [
      /\$t\(['"]([^'"]+)['"]\)/g,
      /\bt\(['"]([^'"]+)['"]\)/g,
      /i18n\.t\(['"]([^'"]+)['"]\)/g
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(lineText)) !== null) {
        const keyStart = match.index + match[0].indexOf(match[1]);
        const keyEnd = keyStart + match[1].length;

        if (position.character >= keyStart && position.character <= keyEnd) {
          return new vscode.Range(
            position.line,
            keyStart,
            position.line,
            keyEnd
          );
        }
      }
    }

    return undefined;
  }
}

export function registerHoverProvider(
  context: vscode.ExtensionContext,
  store: TranslationStore
): void {
  const provider = new TranslationHoverProvider(store);

  const languages = ['vue', 'typescript', 'javascript', 'typescriptreact', 'javascriptreact'];

  for (const language of languages) {
    const disposable = vscode.languages.registerHoverProvider(
      { language, scheme: 'file' },
      provider
    );
    context.subscriptions.push(disposable);
  }
}
