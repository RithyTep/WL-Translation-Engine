import * as vscode from 'vscode';
import { TranslationStore } from '../services/translationStore';

const DIAGNOSTIC_SOURCE = 'kirby-i18n';

export class TranslationDiagnosticsProvider {
  private store: TranslationStore;
  private diagnosticCollection: vscode.DiagnosticCollection;
  private disposables: vscode.Disposable[] = [];

  constructor(store: TranslationStore) {
    this.store = store;
    this.diagnosticCollection = vscode.languages.createDiagnosticCollection(DIAGNOSTIC_SOURCE);
  }

  public activate(context: vscode.ExtensionContext): void {
    // Initial scan of open documents
    vscode.workspace.textDocuments.forEach(doc => this.updateDiagnostics(doc));

    // Listen to document changes
    this.disposables.push(
      vscode.workspace.onDidChangeTextDocument(event => {
        this.updateDiagnostics(event.document);
      })
    );

    // Listen to document open
    this.disposables.push(
      vscode.workspace.onDidOpenTextDocument(doc => {
        this.updateDiagnostics(doc);
      })
    );

    // Listen to document close
    this.disposables.push(
      vscode.workspace.onDidCloseTextDocument(doc => {
        this.diagnosticCollection.delete(doc.uri);
      })
    );

    // Refresh when translation store changes
    this.disposables.push(
      this.store.onDidChange(() => {
        vscode.workspace.textDocuments.forEach(doc => this.updateDiagnostics(doc));
      })
    );

    // Add to context for cleanup
    context.subscriptions.push(this.diagnosticCollection);
    this.disposables.forEach(d => context.subscriptions.push(d));
  }

  private updateDiagnostics(document: vscode.TextDocument): void {
    // Only check supported languages
    const supportedLanguages = ['vue', 'typescript', 'javascript', 'typescriptreact', 'javascriptreact'];
    if (!supportedLanguages.includes(document.languageId)) {
      return;
    }

    const diagnostics: vscode.Diagnostic[] = [];
    const text = document.getText();

    const patterns = [
      /\$t\(['"]([^'"]+)['"]\)/g,
      /\bt\(['"]([^'"]+)['"]\)/g,
      /i18n\.t\(['"]([^'"]+)['"]\)/g
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const key = match[1];

        if (!this.store.keyExists(key)) {
          const startPos = document.positionAt(match.index);
          const endPos = document.positionAt(match.index + match[0].length);
          const range = new vscode.Range(startPos, endPos);

          const diagnostic = new vscode.Diagnostic(
            range,
            `Translation key not found: "${key}"`,
            vscode.DiagnosticSeverity.Warning
          );
          diagnostic.source = DIAGNOSTIC_SOURCE;
          diagnostic.code = 'missing-translation-key';

          diagnostics.push(diagnostic);
        }
      }
    }

    this.diagnosticCollection.set(document.uri, diagnostics);
  }

  public dispose(): void {
    this.diagnosticCollection.dispose();
    this.disposables.forEach(d => d.dispose());
  }
}

export function registerDiagnosticsProvider(
  context: vscode.ExtensionContext,
  store: TranslationStore
): TranslationDiagnosticsProvider {
  const provider = new TranslationDiagnosticsProvider(store);
  provider.activate(context);
  return provider;
}
