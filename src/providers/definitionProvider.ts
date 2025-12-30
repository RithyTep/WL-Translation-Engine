import * as vscode from 'vscode';
import { TranslationStore } from '../services/translationStore';

export class TranslationDefinitionProvider implements vscode.DefinitionProvider {
  private store: TranslationStore;

  constructor(store: TranslationStore) {
    this.store = store;
  }

  public provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken
  ): vscode.Definition | undefined {
    const keyInfo = this.getTranslationKeyAtPosition(document, position);

    if (!keyInfo) {
      return undefined;
    }

    const { key } = keyInfo;

    if (!this.store.keyExists(key)) {
      return undefined;
    }

    const sourceLanguage = this.store.getSourceLanguage();
    const filePath = this.store.getFilePathForLanguage(sourceLanguage);
    const lineNumber = this.store.findKeyLineInFile(key, sourceLanguage);

    if (lineNumber < 0) {
      return undefined;
    }

    const uri = vscode.Uri.file(filePath);
    const targetPosition = new vscode.Position(lineNumber, 0);

    return new vscode.Location(uri, targetPosition);
  }

  private getTranslationKeyAtPosition(
    document: vscode.TextDocument,
    position: vscode.Position
  ): { key: string; range: vscode.Range } | undefined {
    const line = document.lineAt(position);
    const lineText = line.text;

    // Separate patterns for single and double quotes to handle apostrophes in text
    // Use negative lookbehind (?<!\$) to prevent t() from matching $t()
    const patterns = [
      /\$t\("([^"]+)"\)/g,
      /\$t\('([^']+)'\)/g,
      /(?<!\$)\bt\("([^"]+)"\)/g,
      /(?<!\$)\bt\('([^']+)'\)/g,
      /i18n\.t\("([^"]+)"\)/g,
      /i18n\.t\('([^']+)'\)/g
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(lineText)) !== null) {
        const keyStart = match.index + match[0].indexOf(match[1]);
        const keyEnd = keyStart + match[1].length;

        if (position.character >= keyStart && position.character <= keyEnd) {
          return {
            key: match[1],
            range: new vscode.Range(position.line, keyStart, position.line, keyEnd)
          };
        }
      }
    }

    return undefined;
  }
}

export function registerDefinitionProvider(
  context: vscode.ExtensionContext,
  store: TranslationStore
): void {
  const provider = new TranslationDefinitionProvider(store);

  const languages = ['vue', 'typescript', 'javascript', 'typescriptreact', 'javascriptreact'];

  for (const language of languages) {
    const disposable = vscode.languages.registerDefinitionProvider(
      { language, scheme: 'file' },
      provider
    );
    context.subscriptions.push(disposable);
  }
}
