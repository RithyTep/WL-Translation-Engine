import * as vscode from 'vscode';
import { TranslationStore } from '../services/translationStore';

export class TranslationReferenceProvider implements vscode.ReferenceProvider {
  private store: TranslationStore;

  constructor(store: TranslationStore) {
    this.store = store;
  }

  public async provideReferences(
    document: vscode.TextDocument,
    position: vscode.Position,
    _context: vscode.ReferenceContext,
    _token: vscode.CancellationToken
  ): Promise<vscode.Location[]> {
    const keyInfo = this.getTranslationKeyAtPosition(document, position);

    if (!keyInfo) {
      return [];
    }

    const { key } = keyInfo;
    const locations: vscode.Location[] = [];

    // Search in workspace files
    const fileGlob = '**/*.{vue,ts,js,tsx,jsx}';
    const files = await vscode.workspace.findFiles(fileGlob, '**/node_modules/**', 500);

    for (const fileUri of files) {
      try {
        const fileDoc = await vscode.workspace.openTextDocument(fileUri);
        const fileLocations = this.findKeyInDocument(fileDoc, key);
        locations.push(...fileLocations);
      } catch (error) {
        // Skip files that can't be opened
        console.error(`Error reading ${fileUri.fsPath}:`, error);
      }
    }

    return locations;
  }

  private findKeyInDocument(document: vscode.TextDocument, key: string): vscode.Location[] {
    const locations: vscode.Location[] = [];
    const text = document.getText();

    // Escape special regex characters in the key
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const patterns = [
      new RegExp(`\\$t\\(['"]${escapedKey}['"]\\)`, 'g'),
      new RegExp(`\\bt\\(['"]${escapedKey}['"]\\)`, 'g'),
      new RegExp(`i18n\\.t\\(['"]${escapedKey}['"]\\)`, 'g')
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const startPos = document.positionAt(match.index);
        const endPos = document.positionAt(match.index + match[0].length);
        locations.push(new vscode.Location(document.uri, new vscode.Range(startPos, endPos)));
      }
    }

    return locations;
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

export function registerReferenceProvider(
  context: vscode.ExtensionContext,
  store: TranslationStore
): void {
  const provider = new TranslationReferenceProvider(store);

  const languages = ['vue', 'typescript', 'javascript', 'typescriptreact', 'javascriptreact'];

  for (const language of languages) {
    const disposable = vscode.languages.registerReferenceProvider(
      { language, scheme: 'file' },
      provider
    );
    context.subscriptions.push(disposable);
  }
}
