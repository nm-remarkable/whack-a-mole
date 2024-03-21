import * as vscode from 'vscode';
import {
    NukeDiagnostic,
    ConstDiagnostic,
    SwearDiagnostic,
    LoggingDiagnostic,
    FakeDiagnostic,
} from './fakeDiagnostics';

const fakeDiagnostic: Map<string, FakeDiagnostic> = new Map();
const diagnosticTypes = [
    NukeDiagnostic,
    ConstDiagnostic,
    SwearDiagnostic,
    LoggingDiagnostic,
];
const maxFakeDiagnostics = 2;

export function activate(context: vscode.ExtensionContext) {
    // Create a collection to report diagnostics to VS Code
    const diagnosticCollection =
        vscode.languages.createDiagnosticCollection('whack-a-mole');

    setInterval(() => {
        const document = vscode.window.activeTextEditor?.document;
        if (!document) {
            return;
        }
        if (fakeDiagnostic.size < maxFakeDiagnostics) {
            createFakeDiagnostic(document);
        }
        const vscodeDiagnostics: vscode.Diagnostic[] = [];
        fakeDiagnostic.forEach((fake) =>
            vscodeDiagnostics.push(fake.transform())
        );
        diagnosticCollection.set(document.uri, vscodeDiagnostics);
    }, 500);

    // vscode.workspace.onDidChangeTextDocument((event) => { });

    // Add to a list of disposables which are disposed when this extension is deactivated.
    context.subscriptions.push(diagnosticCollection);
}

function createFakeDiagnostic(document: vscode.TextDocument) {
    const diagnosticType =
        diagnosticTypes[Math.floor(Math.random() * diagnosticTypes.length)];
    if (fakeDiagnostic.has(diagnosticType.name)) {
        return;
    }
    const fake = diagnosticType.create(document);
    if (fake) {
        fakeDiagnostic.set(diagnosticType.name, fake);
    }
}

export function deactivate() {}
