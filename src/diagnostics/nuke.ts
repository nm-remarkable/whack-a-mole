import { Range, TextDocument, DiagnosticSeverity, window } from 'vscode';
import {
    FakeDiagnostic,
    FakeDiagnosticBuilder,
    updateInterval,
    baseDiagnosticTime,
} from './interface';

export class NukeDiagnostic extends FakeDiagnostic {
    static create(document: TextDocument) {
        const builder = new FakeDiagnosticBuilder();
        // An empty document is not worth nuking
        if (document.lineCount <= 2) {
            return undefined;
        }
        builder
            .setMessage('!!WARNING!! NUCLEAR WARHEAD INCOMING !!WARNING!!')
            .setSeverity(DiagnosticSeverity.Error)
            .setTimer(baseDiagnosticTime * 5)
            .setUpdate((instance: FakeDiagnostic) => {
                instance.timer -= updateInterval;
                instance.hidden = !instance.hidden;
            });
        return builder.build(
            NukeDiagnostic.name,
            new Range(0, 0, document.lineCount, 200), // Entire document
            execute
        );
    }
}

function execute(instance: FakeDiagnostic, document: TextDocument) {
    // Delete all text in the document
    let fullTextRange = new Range(
        document.positionAt(0),
        document.positionAt(document.getText().length)
    );
    window.activeTextEditor?.edit((editBuilder) => {
        editBuilder.delete(fullTextRange);
    });
}
