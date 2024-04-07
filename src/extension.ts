import * as vscode from 'vscode';
import { FakeDiagnostic, updateInterval } from './diagnostics/interface';
import { diagnosticTypes, maxFakeDiagnostics } from './globals';

const diagnosticMap: Map<string, FakeDiagnostic> = new Map();
// Create a collection to report diagnostics to VS Code
const diagnosticCollection =
    vscode.languages.createDiagnosticCollection('whack-a-mole');

export function activate(context: vscode.ExtensionContext) {
    setInterval(updateLoop, updateInterval);
    vscode.workspace.onDidChangeTextDocument((event) => {
        event.contentChanges.forEach((change) => {
            diagnosticMap.forEach((diagnostic) => {
                // Changes after the line of our diagnostic
                // will not influence the position of our diagnostic
                if (diagnostic.range.start.line > change.range.start.line - 1) {
                    let lineDelta = 0;
                    if (change.rangeLength > 1) {
                        // Undo / Redo / Delete multiple characters
                        lineDelta =
                            change.range.start.line - change.range.end.line;
                    } else if (change.text.includes('\n')) {
                        lineDelta = change.text.split('\n').length - 1;
                    }
                    const isValid = diagnostic.stillApplies(
                        diagnostic,
                        event.document,
                        lineDelta
                    );
                    if (!isValid) {
                        // TODO: diagnosticMap.delete(diagnostic.name);
                    }
                }
            });
        });
    });
    // Add to a list of disposables which are disposed when this extension is deactivated.
    context.subscriptions.push(diagnosticCollection);
}

function updateLoop() {
    const document = vscode.window.activeTextEditor?.document;
    if (!document) {
        return;
    }
    if (diagnosticMap.size < maxFakeDiagnostics) {
        createFakeDiagnostic(document);
    }
    const vscodeDiagnostics: vscode.Diagnostic[] = [];
    diagnosticMap.forEach((diagnostic, key, map) => {
        diagnostic.update(diagnostic); // usually just a timer countdown
        if (diagnostic.timer <= 0) {
            map.delete(key); // We don't need you anymore
            diagnostic.execute(diagnostic, document);
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
    if (diagnosticMap.has(diagnosticType.name)) {
        return;
    }
    const fake = diagnosticType.create(document);
    if (fake) {
        diagnosticMap.set(diagnosticType.name, fake);
    }
}

export function deactivate() {
    diagnosticMap.clear(); // have to clear manually since its not a builtin vscode diagnostic
}
