import * as vscode from 'vscode';
import { FakeDiagnostic, updateInterval } from './diagnostics/interface';
import { weightedDiagnosticType, maxFakeDiagnostics } from './globals';

type DiagnosticMap = Map<string, FakeDiagnostic>;
var diagnosticMap: DiagnosticMap = new Map();
const documentDiagnostics: Map<string, DiagnosticMap> = new Map();
var updateDiagnosticsInterval: NodeJS.Timeout;
const newDiagnosticInterval = 30000;

// Create a collection to report diagnostics to VS Code
const collection = vscode.languages.createDiagnosticCollection('whack-a-mole');

export function activate(context: vscode.ExtensionContext) {
    newDiagnostic();
    updateDiagnosticsInterval = setInterval(updateLoop, updateInterval);

    // Add to a list of disposables which are disposed when this extension is deactivated.
    context.subscriptions.push(collection);
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument((event) =>
            onTextDocumentChanged(event)
        )
    );
    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument((doc) => {
            diagnosticMap = documentDiagnostics.get(doc.fileName) ?? new Map();
            newDiagnostic();
        })
    );
    context.subscriptions.push(
        vscode.workspace.onDidCloseTextDocument((doc) => {
            documentDiagnostics.set(doc.fileName, diagnosticMap);
        })
    );
}

function updateLoop() {
    const document = vscode.window.activeTextEditor?.document;
    if (!document) {
        return;
    }
    diagnosticMap.forEach((diagnostic, key, map) => {
        if (diagnostic.documentUri !== document.uri) {
            return;
        }
        diagnostic.update(diagnostic); // usually just a timer countdown
        if (diagnostic.timer <= 0) {
            map.delete(key); // We don't need you anymore
            diagnostic.execute(diagnostic, document);
            newDiagnostic();
            return;
        }
    });
    notifyDiagnosticChanges(document, diagnosticMap);
}

function newDiagnostic() {
    setTimeout(() => {
        const document = vscode.window.activeTextEditor?.document;
        if (!document) {
            return;
        }
        if (diagnosticMap.size < maxFakeDiagnostics) {
            var fake = undefined;
            while (!fake) {
                const diagnosticType = weightedDiagnosticType();
                if (diagnosticMap.has(diagnosticType.name)) {
                    return;
                }
                fake = diagnosticType.create(document);
                if (fake) {
                    diagnosticMap.set(diagnosticType.name, fake);
                }
            }
        }
        notifyDiagnosticChanges(document, diagnosticMap);
    }, newDiagnosticInterval);
}

function notifyDiagnosticChanges(
    document: vscode.TextDocument,
    diagnosticMap: Map<string, FakeDiagnostic>
) {
    const vscodeDiagnostics: vscode.Diagnostic[] = [];
    diagnosticMap.forEach((diagnostic) => {
        // Allows for hidden diagnostics or blinking diagnostics
        // In the case of the Nuke diagnostic we hide it on each update so we get a blinking effect
        if (diagnostic.documentUri === document.uri && !diagnostic.hidden) {
            vscodeDiagnostics.push(diagnostic.transform());
        }
        console.log('Diagnostic updated', diagnostic.name, diagnostic.timer);
    });
    collection.set(document.uri, vscodeDiagnostics);
}

function onTextDocumentChanged(event: vscode.TextDocumentChangeEvent) {
    event.contentChanges.forEach((change) => {
        diagnosticMap.forEach((diagnostic, key, map) => {
            // Changes after the line of our diagnostic
            // will not influence the position of our diagnostic
            if (diagnostic.range.start.isAfterOrEqual(change.range.start)) {
                // updates range of match if the match is not fixed
                const isValid = diagnostic.stillApplies(
                    diagnostic,
                    change,
                    event.document
                );
                if (!isValid) {
                    map.delete(key);
                    newDiagnostic();
                }
            }
        });
    });
    notifyDiagnosticChanges(event.document, diagnosticMap);
}

export function deactivate() {
    // have to clear manually since its not a builtin vscode diagnostic
    diagnosticMap.clear();
    documentDiagnostics.clear();
    clearInterval(updateDiagnosticsInterval);
}
