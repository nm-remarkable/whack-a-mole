import * as vscode from 'vscode';
import {
    updateInterval,
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
// Create a collection to report diagnostics to VS Code
const diagnosticCollection =
    vscode.languages.createDiagnosticCollection('whack-a-mole');

export function activate(context: vscode.ExtensionContext) {
    setInterval(updateLoop, updateInterval);
    // vscode.workspace.onDidChangeTextDocument((event) => { });

    // Add to a list of disposables which are disposed when this extension is deactivated.
    context.subscriptions.push(diagnosticCollection);
}

function updateLoop() {
    const document = vscode.window.activeTextEditor?.document;
    if (!document) {
        return;
    }
    if (fakeDiagnostic.size < maxFakeDiagnostics) {
        createFakeDiagnostic(document);
    }
    const vscodeDiagnostics: vscode.Diagnostic[] = [];
    fakeDiagnostic.forEach((diagnostic, key, map) => {
        diagnostic.update(diagnostic); // usually just a timer countdown
        if (diagnostic.timer <= 0) {
            diagnostic.execute(document);
            map.delete(key); // We don't need you anymore
            return;
        }
        // Allows for hidden diagnostics or blinking diagnostics
        // In the case of the Nuke diagnostic we hide it on each update so we get a blinking effect
        if (!diagnostic.hidden) {
            vscodeDiagnostics.push(diagnostic.transform());
        }
    });
    diagnosticCollection.set(document.uri, vscodeDiagnostics);
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

export function deactivate() {
    fakeDiagnostic.clear(); // have to clear manually since its not a builtin vscode diagnostic
}
