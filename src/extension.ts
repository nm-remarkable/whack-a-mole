import * as vscode from 'vscode';
import { ActivityBarView } from './activarbar-view';
import { FakeDiagnostic, updateInterval } from './diagnostics/interface';
import { weightedDiagnosticType, maxFakeDiagnostics } from './globals';

type DiagnosticMap = Map<string, FakeDiagnostic>;
var diagnosticMap: DiagnosticMap = new Map();
const documentDiagnostics: Map<string, DiagnosticMap> = new Map();
var updateDiagnosticsInterval: NodeJS.Timeout;
var sessionScore = 0;
var activityBarView: ActivityBarView;

// Create a collection to report diagnostics to VS Code
const collection = vscode.languages.createDiagnosticCollection('whack-a-mole');

export function activate(context: vscode.ExtensionContext) {
    updateDiagnosticsInterval = setInterval(updateLoop, updateInterval);

    activityBarView = new ActivityBarView(() => {
        return sessionScore;
    });

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
    const config = vscode.workspace.getConfiguration('whack-a-mole');
    const timer: number = Number(config.get('newWarningTimer')) * 1000;
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
    }, timer);
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
    collection.set(document.uri, vscodeDiagnostics);
}

function onTextDocumentChanged(event: vscode.TextDocumentChangeEvent) {
    event.contentChanges.forEach((change) => {
        diagnosticMap.forEach((diagnostic, key, map) => {
            // Changes after the line of our diagnostic
            // will not influence the position of our diagnostic
            if (change.range.start.isBefore(diagnostic.range.end)) {
                // updates range of match if the match is not fixed
                const isValid = diagnostic.stillApplies(
                    diagnostic,
                    change,
                    event.document
                );
                if (!isValid) {
                    sessionScore += 1;
                    activityBarView.update();
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
