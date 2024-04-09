import * as vscode from 'vscode';
import { FakeDiagnostic, updateInterval } from './diagnostics/interface';
import { weightedDiagnosticType, maxFakeDiagnostics } from './globals';

type DiagnosticMap = Map<string, FakeDiagnostic>;
var diagnosticMap: DiagnosticMap = new Map();
const documentDiagnostics: Map<string, DiagnosticMap> = new Map();
// Create a collection to report diagnostics to VS Code
const diagnosticCollection =
    vscode.languages.createDiagnosticCollection('whack-a-mole');
var loopInterval: NodeJS.Timeout;

export function activate(context: vscode.ExtensionContext) {
    loopInterval = setInterval(updateLoop, updateInterval);
    // Add to a list of disposables which are disposed when this extension is deactivated.
    context.subscriptions.push(diagnosticCollection);
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument((event) =>
            onTextDocumentChanged(event)
        )
    );
    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument((doc) => {
            diagnosticMap = documentDiagnostics.get(doc.fileName) ?? new Map();
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
    if (diagnosticMap.size < maxFakeDiagnostics) {
        createFakeDiagnostic(document);
    }
    diagnosticMap.forEach((diagnostic, key, map) => {
        if (diagnostic.documentUri !== document.uri) {
            return;
        }
        diagnostic.update(diagnostic); // usually just a timer countdown
        if (diagnostic.timer <= 0) {
            map.delete(key); // We don't need you anymore
            diagnostic.execute(diagnostic, document);
            return;
        }
    });
    notifyDiagnosticChanges(document, diagnosticMap);
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
    });
    diagnosticCollection.set(document.uri, vscodeDiagnostics);
}

function createFakeDiagnostic(document: vscode.TextDocument) {
    const diagnosticType = weightedDiagnosticType();
    if (diagnosticMap.has(diagnosticType.name)) {
        return;
    }
    const fake = diagnosticType.create(document);
    if (fake) {
        diagnosticMap.set(diagnosticType.name, fake);
    }
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
    clearInterval(loopInterval);
}
